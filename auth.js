"use strict";

var cluster = require('cluster'),
    crypto = require('crypto');

if (cluster.isMaster)
    module.exports.master = master;

if (cluster.isWorker)
    module.exports.worker = worker;

function master() {
    
}

function rateLimiter(interval) {
    var rateRecords = {};

    return function(req, res, callback, thisArg) {
        var ip = req.ip,
            rateRecord = ip && rateRecords[ip],
            now = Date.now();
        
        if (rateRecord === undefined) {
            rateRecord = setTimeout(
                rateLimiterTimeoutHandler, interval,
                rateRecords, ip);
            
            rateRecords[ip] = rateRecord;
            
            return callback.call(thisArg, req, res);
        } else {
            res.status(429).send('Reduce your rate');
        }
    };
}

function rateLimiterTimeoutHandler(rateRecords, ip) {
    delete rateRecords[ip];
}

function worker(cluster, app, jsonParser) {
    var authdb = require('./authdb'),
        authRateLimiter = rateLimiter(5000);
    
    app.post('/api/auth', function(req, res) {
        authRateLimiter(req, res, function(req, res) {
            var username = req.params.username,
                password = req.params.password;
            
            
        });
    });
    
    app.get('/api/auth/perf', function(req, res) {
        console.log('got perf request');
        
        var iter = 0,
            results = [],
            failed = false;
            
        console.log('starting perf');
        
        (new Promise(function again(resolve, reject) {
            console.log('starting promise');
            
            var timing = {
                iter: iter, 
                start: Date.now(), 
                end: 0,
                elap: 0,
                key: '',
                err: null
            };
            results.push(timing);

            console.log('measuring perf start iter ', iter);
            
            crypto.pbkdf2('secret' + iter, 'salt', 262139, 384>>3, 'sha256',
            function(err, key) {
                console.log('measuring perf finish iter ', iter);
                
                if (err) {
                    console.log(err);
                    timing.err = err;
                    failed = true;
                } else {
                    timing.key = key.toString('base64');
                    timing.end = Date.now();
                    timing.elap = timing.end - timing.start;
                }
                
                if (++iter < 10) {
                    console.log('starting next iter');
                    resolve(new Promise(again));
                } else if (!failed) {
                    console.log('starting next iter');
                    resolve(results);
                } else {
                    reject(results);
                }
            });
        })).then(function(results) {
            res.send(results);
        }, function(err) {
            res.status(500).send(err);
        });
    });
}
