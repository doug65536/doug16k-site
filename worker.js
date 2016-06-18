"use strict";

var cluster = require('cluster'),
    fs = require('fs'),
    path = require('path'),
    ipc = require('./cluster-ipc'),
    guid = '683123cc-8214-44a1-a456-aa5c544698ca',
    appModules = [
        require('./chatserver'),
        require('./auth')
    ],
    dhparam,
    crypto;

if (cluster.isMaster)
    module.exports.master = master;

if (cluster.isWorker)
    module.exports.worker = worker;

function master() {
    var stopping = false,
        ticketKeys;
    
    console.log('starting master');

    dhparam = require('dhparam');
    crypto = require('crypto');
    
    ticketKeys = randomBytesAsync(48)
    .then(function(randomTicketKeys) {
        return writeTicketKeys(randomTicketKeys);
    });
    
    dhpReadOrGenerate('dhparam.pem').then(function(dhp) {
        //appModules.forEach(function(appModule) {
        //    appModule.master();
        //});

        // Echo enabled
        ipc.masterRepeater(guid, true);

        // Wait for ticket keys to write out before starting
        ticketKeys.then(function() {
            return startAllWorkers();
        }).then(function() {
            // Load applications
            appModules.forEach(function(module) {
                module.master(cluster);
            });
        });
    }, function(err) {
        console.error(err);
    });
    
    function startWorker() {
        console.log('starting new worker');
        var worker = cluster.fork();

        worker.on('exit', function(code, signal) {
            if (signal) {
                console.log('worker was killed by signal: ' + signal);
            } else if (code !== 0) {
                console.log('worker exited with error code: ' + code);
            } else {
                console.log('worker success!');
            }
            if (!stopping)
                startWorker();
        });
        
        return worker;
    }

    function startAllWorkers(){
//        process.on('SIGHUP', function() {
//            console.log('Recycling workers');
//            sendCommandToAllWorkers({command:'recycle'});
//        }).on('SIGINT', function() {
//            stopping = true;
//            sendCommandToAllWorkers({command:'recycle'});
//        });

        return new Promise(function(resolve) {
            var workerCount = 2,
                onlineCount = 0,
                i;
            for (i = 0; i < workerCount; ++i) {
                startWorker().on('online', function(worker) {
                    if (++onlineCount === workerCount)
                        resolve();
                });
            }
        });
    }
    
    function sendCommandToAllWorkers(command) {
        Object.values(cluster.workers).forEach(function(worker) {
            worker.send(this);
        }, command);
    }
};

function worker() {
    console.log('starting worker');
    var workerConfig = require('./workerconfig.js'),
        https = require('https'),
        http = require('http'),
        fs = require('fs'),
        express = require('express'),
        bodyParser = require('body-parser'),
        jsonParser = bodyParser.json(),
        compression = require('compression'),
        helmet = require('helmet'),
        app = express(),
        staticMiddleware,
        //serverAddr = process.env.IP || '0.0.0.0',
        //serverPort = process.env.PORT || 80,
        httpServer,
        server;

    ipc.workerReceiver(guid, function(message) {
        if (message.command === 'recycle') {
            console.log('got worker recycle in ' + cluster.worker.id);
            server.close(function() {
                console.log('server close completed');
                cluster.worker.disconnect();
            });
        }
    });
    
    app.use(helmet.hsts());
    
    app.all('*', function(req, res, next) {
        var url;
        
        if (req.secure) {
            next();
        } else {
            url = 'https://' + workerConfig.config.domain + req.url;
            res.redirect(url);
        }
    });
    
    app.set('etag', 'strong');
    
    // Use compression configured for medium-high speed
    app.use(compression({
        level: 3
    }));

    // Load applications
    appModules.forEach(function(appModule) {
        appModule.worker(cluster, app, jsonParser);
    });

    var templateData = {
        head: fs.readFileSync('private/pagehead.html', 'utf8'),
        foot: fs.readFileSync('private/pagefoot.html', 'utf8')
    };
    
    var templateCache = {};

    app.get('/*.html', function(req, res) {
        var cacheSlot = templateCache[req.path];
        if (!cacheSlot) {
            cacheSlot = readFileAsync('public/' + req.path, 'utf8')
            .then(function(file) {
                var basename = path.basename(req.path, '.html'),
                    head = processTemplate(templateData.head, {
                        basename: basename
                    }),
                    foot = processTemplate(templateData.foot, {
                        basename: basename
                    });
                return [head, file, foot];
            }, function(err) {
                throw new Error('read error', 'public/' + req.path);
            });
            templateCache[req.path] = cacheSlot;
        }
        cacheSlot.then(function(data) {
            res.header('Content-Type', 'text/html');
            console.log(data.length, 'length');
            data.forEach(function(block) {
                res.write(block);
            });
            res.end();
        }, function(err) {
            res.status(500).send(err.toString());
        });
    });

    // Public server
    staticMiddleware = express.static(__dirname + '/public');
    app.use(staticMiddleware);

    //server = app.listen(serverPort, serverAddr);
    
    Promise.all([
        readTicketKeys(),
        dhpReadOrGenerate('dhparam.pem')
    ]).then(function(p) {
        var ticketKeys = p[0],
            dhp = p[1];
        
        console.log('worker configured', ticketKeys, dhp);
        
        //workerConfig.config.serverOptions.ticketKeys = ticketKeys;
        workerConfig.config.serverOptions.dhparam = dhp;
        
        server = https.createServer(workerConfig.config.serverOptions, app)
            .listen(443);
        httpServer = app.listen(80);
    }).catch(function(err) {
        console.log('error!', err);
        throw err;
    });
};

function processTemplate(template, data) {
    return template.replace(/{{(.*?)}}/g, function(whole, match, offset, input) {
        var replacement = data[match];
        if (replacement === undefined) {
            console.log('warning: missing template data property', match);
            return '';
        } else if (typeof replacement === 'function') {
            return replacement(match, data, input);
        } else {
            return data[match];
        }
    });
}

function dhpReadOrGenerate(file) {
    return readFileAsync(file)
        .then(function(dhp) {
            console.log('Read cached Diffie-Hellman parameters');
            return dhp;
        }, function(err) {
            var dhp;
            console.log('Generating Diffie-Hellman parameters...');
            return dhpGenerateAndWrite(file);
        }).then(function(dhp) {
            console.log('Generating Diffie-Hellman parameters done');
            return dhp;
        });
}

function readFileAsync(file, encoding) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, encoding, function(err, dhp) {
            if (!err)
                resolve(dhp);
            else
                reject(err);
        });
    });
}

function dhpGenerateAndWrite(file) {
    return dhpGenerateAsync().then(function(dhp) {
        return writeFileAsync(file, dhp);
    });
}

function dhpGenerateAsync() {
    return new Promise(function(resolve, reject) {
        resolve(dhparam());
    });
}

function writeFileAsync(file, content) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(file, content, function(err) {
            if (!err)
                resolve(content);
            else
                reject(err);
        });
    });
}

function randomBytesAsync(size) {
    return new Promise(function(resolve, reject) {
        crypto.randomBytes(48, function(err, buf) {
            if (!err)
                resolve(buf);
            else
                reject(err);
        });
    });
}

function readTicketKeys() {
    return readFileAsync('ticketkeys.dat');
}

function writeTicketKeys(randomTicketKeys) {
    return writeFileAsync('ticketkeys.dat',
        randomTicketKeys.toString('base64'));
}
