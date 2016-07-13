/* global console */
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
    .catch(util.makeErrorDumper('chat sync'));

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
}

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
    
    // use single request to get messages from multiple rooms
    // ?since=12:34,56:789
    // to wait for messages in room 12 since 34,
    // and wait for messages in room 56 
    app.get('/api/wschat/rooms/message/stream', function(req, res) {
        var since = req.query.since,
            noWait = +req.query.nowait !== 0,
            allWait,
            roomItems,
            roomPairs,
            valid;
        
        roomPairs = since && since.length > 0 &&
            since.split(/ /);
        
        roomItems = roomPairs && roomPairs.map(function(item) {
            var itemPair = item.split(/!/),
                roomId = +itemPair[0],
                messageId = +itemPair[1];
            return roomId === roomId && 
                messageId === messageId &&
                roomId > 0 &&
                messageId >= -1 && {
                room: roomId,
                since: messageId,
                wait: messageId === roomLatest[roomId]
            };
        });
        
        valid = roomItems && roomItems.every(function(item) {
            return !!item;
        });
        
        if (!valid) {
            res.status(400).send('Bad request');
            return;
        }
        
        allWait = roomItems && roomItems.every(function(item) {
            return item.wait;
        });
        
        if (allWait && noWait) {
            res.send({});
        } else if (allWait) {
            console.log('eager wait');
            waitForRoomActivity(res, roomItems);
        } else {
            // Force it to do one query at a time,
            // build up results
            console.log(roomItems);
            gatherResults(roomItems).then(function(results) {
                var empty = (!results || Object.keys(results).length === 0);
                
                if (!empty || noWait) {
                    res.send({
                        rooms: results
                    });
                } else if (empty) {
                    waitForRoomActivity(res, roomItems);
                }
            }, util.makeErrorDumper('multi room message stream'));
        }
        
        function waitForRoomActivity(res, roomItems) {
            var waitQueue,
                waiter;
            
            waiter = {
                res: res,
                roomItems: roomItems,
                timeout: 0
            };

            // Add entry to every room's queue
            roomItems.forEach(function(roomItem) {
                var room = roomItem.room;
                
                if (!waitQueues[room]) {
                    console.log('creating queue for room', room);
                }

                // Get room queue or create new queue
                waitQueue = waitQueues[room] ||
                    (waitQueues[room] = []);

                waitQueue.push(waiter);
            });

            res.setHeader('Connection', 'close');

            // If connection closes abruptly, remove from queue
            req.on('close', requestClosed);

            req.setTimeout(5 * 60 * 1000);

            // Timeout in 3.5 minutes
            waiter.timeout = setTimeout(requestTimedOut, 210000, 
                roomItems, waiter);

            function requestClosed() {
                if (waiter.timeout !== undefined) {
                    clearTimeout(waiter.timeout);
                    waiter.timeout = undefined;
                }

                removeFromQueues(roomItems, waiter);
            }
        }
        
        function requestTimedOut(roomItems, waiter) {
            waiter.timeout = undefined;
            
            if (removeFromQueues(roomItems, waiter))
                waiter.res.send({});
        }
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
                roomItems: since,
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
            waiter.timeout = setTimeout(requestTimedOut, 5000, //210000, 
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
            
            if (removeFromQueue(waitQueue, waiter))
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
    
    function gatherResults(roomItems, i, results) {
        i = i || 0;
        var roomId = roomItems[i].room,
            since = roomItems[i].since;
        
        return (chatdb.getSomeFromId(roomId, since || -1, defaultLimit)
        .then(function(messages) {
            if (messages && messages.length) {
                if (!results)
                    results = {};

                results[roomId] = messages;
            }

            if (i + 1 < roomItems.length)
                return gatherResults(roomItems, i + 1, results);

            return results;
        }));
    }
    
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
    
    function removeFromQueues(roomItems, waiter) {
        return roomItems.reduce(function(result, roomItem) {
            return removeFromQueue(waitQueues[roomItem.room], waiter) || result;
        }, false);
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
            
            // Remove it from the other queues
            waiter.roomItems.forEach(function(roomItem) {
                var otherQueue,
                    index,
                    removed;
                if (roomItem.room === room)
                    return;
                otherQueue = waitQueues[roomItem.room];
                index = otherQueue.indexOf(waiter);
                removed = otherQueue.splice(index, 1);
                console.assert(removed);
                console.log('removed waiter from other room', roomItem.room)
            });
            
            sendMessagesSince(waiter.res, room,
                waiter.roomItems, defaultLimit);
        });
    }

    function sendMessagesSince(res, room, since, limit) {
        var messages,
            promises;
        
        gatherResults(since).then(function(results) {
            // Update latest message ids
            Object.keys(results).forEach(function(roomId) {
                var roomMessages = this[roomId],
                    lastMessage = roomMessages[roomMessages.length-1],
                    lastId = lastMessage && lastMessage.id;
                if (lastMessage && roomLatest[roomId] < lastMessage.id)
                    roomLatest[roomId] = lastMessage.id
            }, results);
            
            res.send({
                rooms: results
            });
        }, util.makeErrorDumper('sendMessagesSince'));
    }
}

function spread(fn) {
    return function(pack) {
        return fn.apply(this, pack);
    };
}
