"use strict";

var Promise = require('bluebird'),
    cluster = require('cluster'),
    fs = require('fs'),
    path = require('path'),
    util = require('./util'),
    ipc = require('./cluster-ipc'),
    guidMessage = '08b9caf0-02b9-4ad4-9381-ecab048cc168';

if (cluster.isMaster)
    module.exports.master = master;

if (cluster.isWorker)
    module.exports.worker = worker;

// - at any time, a worker can get a GET and wait for a message
// Flow:
// - one of the workers gets the POST to send a message
// - the worker sends guidMessage to master
// - master inserts it into the database, assigns it an id
// - master broadcasts guidMessage with room name to all workers
// - all workers receive guidMessage and service their wait queue
// - each chat room has its own queue

function master() {
    //console.log('starting chat server master');
    
    var chatdb = require('./chatserverdb'),
        broadcastSender = ipc.makeMasterBroadcastSender(guidMessage),
        userList = {};
    
    chatdb.sync(false)
    .catch(util.makeErrorDumper('chat sync'))
    //.then(function() {
    //    chatdb.createDefaultRoom();
    //});

    //console.log('starting master message receiver');

    // Only the master inserts messages, and broadcasts a 
    // notification for the room
    ipc.masterMessageReceiver(guidMessage, function(msg, worker) {
        //console.log('master got message', msg);
        chatdb.insertMessage(msg)
        .then(function(ins) {
            broadcastSender({
                roomActivity: ins.roomId,
                messageId: ins.id
            });
        }, function(err) {
            console.error('chat message insert error!', err);
            msg.error = err;
            broadcastSender(msg);
        });
    });
    
    //console.log('master listening for messages');
};

function worker(cluster, app, jsonParser) {
    //console.log(cluster.worker.id, 'starting chat server worker');
    
    var chatdb = require('./chatserverdb'),
        waitQueues = {},
        sendMessageToMaster = ipc.makeWorkerSender(guidMessage),
        defaultLimit = 64,
        nextUniqueUsername = Date.now() - 1464414604408,
        emojiPackage,
        emojiPackageTimeout,
        roomLatest = {};
    
    ipc.workerReceiver(guidMessage, function(msg) {
        var room = +msg.roomActivity,
            id = +msg.messageId;
        
        // Remember the newest id, per room, to avoid
        // a lot of SQL queries that return nothing
        roomLatest[room] = id;
        
        console.log('latest', roomLatest);
        
        //console.log('worker received message', msg);
        serviceWaitQueue(msg.roomActivity);
    });

    // Create a room
    app.post('/api/wschat/rooms', jsonParser, function(req, res) {
        //console.log('posting', req.body);
        
        var name = req.body.name;
        
        // create a room
        chatdb.createRoom(null, name).then(function(roomId) {
            res.header('Location', '/api/wschat/rooms/' + roomId);
            res.status(201).send();
        }, makeErrorSender(res));
    });

    // Get list of rooms
    app.get('/api/wschat/rooms', function(req, res) {
        chatdb.getRooms().then(function(rooms) {
            res.send(rooms);
        }, makeErrorSender(res));
    });

    // Get specific room
    app.get('/api/wschat/rooms/:room', function(req, res) {
        var room = +req.params.room;
        
        chatdb.getRoom(room)
        .then(function(record) {
            res.send(record);
        }, makeErrorSender(res));
    });
    
    // delete a room
    app.delete('/api/wschat/rooms/:room', function(req, res) {
        var room = +req.params.room;
        
        // create a room
        chatdb.deleteRoom(room, req.name).then(function(roomId) {
            res.redirect('/api/wschat/rooms/' + roomId).end();
        }, makeErrorSender(res));
    });

    // Send immediate empty response
    app.get('/api/wschat/message/ping', function(req, res) {
        res.send();
    });

    app.get('/api/wschat/rooms/:room/message/stream', function(req, res) {
        var since = req.query.since && +req.query.since || 0,
            room = +req.params.room,
            hint;
        
        //console.log('incoming since', since);
        
        //console.log('since=', typeof since, since);
        if (since === roomLatest[room]) {
            console.log('eager wait because', 
                since, '===', roomLatest[room]);
            waitForRoomActivity(res, room, since);
        } else {
            chatdb.getSomeFromId(room, since || -1, defaultLimit)
            .then(function(messages) {
                //console.log('got some', messages.length);

                if (!messages || !messages.length) {
                    waitForRoomActivity(res, room, since);
                } else {
                    res.send({
                        messages: messages
                    });
                }
            });
        }
        
        function waitForRoomActivity(res, room, since) {
            var waitQueue,
                waiter;
            
            waiter = {
                res: res,
                since: since,
                timeout: 0
            };

            if (!waitQueues[room]) {
                console.log('creating queue for room', room);
            }

            // Get room queue or create new queue
            waitQueue = waitQueues[room] ||
                (waitQueues[room] = []);


            // Remember where this entry might be in the queue
            hint = waitQueue.length;
            waitQueue.push(waiter);

            res.setHeader('Connection', 'close');

            // If connection closes abruptly, remove from queue
            req.on('close', requestClosed);

            req.setTimeout(5 * 60 * 1000);

            // Timeout in 3.5 minutes
            waiter.timeout = setTimeout(requestTimedOut, 210000, 
                waitQueue, waiter);

            function requestClosed() {
                if (waiter.timeout !== undefined) {
                    clearTimeout(waiter.timeout);
                    waiter.timeout = undefined;
                }

                removeFromQueue(waitQueue, waiter, hint);
            }
        }
        
        function requestTimedOut(waitQueue, waiter) {
            waiter.timeout = undefined;
            
            if (removeFromQueue(waitQueue, waiter, hint))
                waiter.res.send({});
        }
    });

    app.post('/api/wschat/rooms/:room/message/stream', jsonParser, 
    function(req, res) {
        var room = +req.params.room,
            sender = req.body.sender,
            replyTo = req.body.replyTo || null,
            message = req.body.message,
            record;
        
        if (!sender || !message) {
            res.status(400).send('Bad request');
            return;
        }

        record = {
            roomId: room,
            sender: sender,
            replyTo: replyTo,
            message: message
        };
        
        //console.log('posting', record);
        
        // Update other servers
        sendMessageToMaster({
            record: record
        });

        res.send({});
    });

    app.get('/api/wschat/unique-username', function(req, res) {
        res.send({
            username: 'user' + nextUniqueUsername++
        });
    });
    
    var emojiDirPrefix = 'public/',
        emojiDir = 'vendor/emojione.com/';
    
    app.get('/api/wschat/emoji-index', function(req, res) {
        fs.readdir(emojiDirPrefix + emojiDir, function(err, files) {
            var filteredFiles;
            
            filteredFiles = files.filter(function(name) {
                return name.substr(-4).toUpperCase() === '.SVG';
            });
            
            res.send({
                dir: emojiDir,
                files: filteredFiles
            });
        });
    });
    
    app.get('/api/wschat/emoji-package', function(req, res) {
        if (!emojiPackage) {
            emojiPackage = (new Promise(function(resolve, reject) {
                fs.readdir(emojiDirPrefix + emojiDir, function(err, files) {
                    if (!err)
                        resolve(files);
                    else
                        reject(err);
                });
            })).then(function(files) {
                return allFileContent(emojiDirPrefix, files);
            });
        }
            
        if (emojiPackageTimeout)
            clearTimeout(emojiPackageTimeout);
        emojiPackageTimeout = setTimeout(function() {
            emojiPackage = null;
        }, 1800000);    // 1800000 = 30 minutes
        
        emojiPackage.then(function(pakage) {
            res.send(pakage);
        });
    });
    
    function makeErrorSender(res) {
        return function(err) {
            console.error(err);
            res.status(500).send(err);
        };
    }
    
    function allFileContent(prefix, files) {
        var index = 0,
            result = {};
        
        return new Promise(function again(resolve, reject) {
            var name = files[index++],
                basename = path.basename(name),
                fullname = prefix + emojiDir + name;
            //console.log('allFileContent:reading:', fullname);
            fs.readFile(fullname, 'utf8', function(err, file) {
                if (err) {
                    reject(err);
                    return;
                }
                
                result[basename] = file;
                
                if (files[index])
                    resolve(new Promise(again));
                else
                    resolve(result);
            });
        }).then(function(result) {
            // Take a bunch of burden off the heap
            return new Buffer(JSON.stringify(result), 'utf8');
        });
    }
    
    function removeFromQueue(waitQueue, waiter, hint) {
        if (hint === undefined || waitQueue[hint] !== waiter)
            hint = waitQueue.indexOf(waiter);
        if (hint >= 0)
            return waitQueue.splice(hint, 1);
    }
    
    function serviceWaitQueue(room) {
        console.assert(room);
        var waitQueue = waitQueues[room];
        if (!waitQueue)
            console.log('no queue for room', room);
        else
            console.log('servicing queue for room', room, waitQueue.length);
        waitQueue && waitQueue.splice(0, waitQueue.length)
        .forEach(function(waiter) {
            if (waiter.timeout) {
                clearTimeout(waiter.timeout);
                waiter.timeout = undefined;
            }
            
            sendMessagesSince(waiter.res, room,
                waiter.since, defaultLimit);
        });
    }

    function sendMessagesSince(res, room, since, limit) {
        var messages;
        
        // Try to get client aligned on id that starts with
        // a multiple of 32, for maximum cache hits
        limit = since < 0 ? limit : (((since + defaultLimit) & -defaultLimit) - since);
        
        return chatdb.getSomeFromId(
                room, since, limit).then(function(messages) {
            var lastMessage,
                roomLatestId;
            
            if (messages) {
                //console.log('sending some from id', messages);
                res.send({
                    messages: messages
                });
                
                console.dir(roomLatest);
                
                // Update latest if new data has higher id for this room
                lastMessage = messages[messages.length - 1];
                roomLatestId = roomLatest[room];
                if (!roomLatestId ||
                    +lastMessage.id > roomLatestId) {
                    roomLatest[room] = +lastMessage.id;
                }
            }
            
            return messages && messages.length && messages || null;
        }, util.makeErrorDumper('sendMessagesSince'));
    }
};
