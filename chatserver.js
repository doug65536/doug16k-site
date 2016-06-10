"use strict";

var cluster = require('cluster'),
    ipc = require('./cluster-ipc'),
    guidMessage = '08b9caf0-02b9-4ad4-9381-ecab048cc168',
    guidPrimeCache = '5522ba1c-b703-4104-9ad5-1c35825098c0';

if (cluster.isMaster)
    module.exports.master = master;

if (cluster.isWorker)
    module.exports.worker = worker;

// - at any time, a worker can get a GET and wait for a message
// Flow:
// - one of the workers gets the POST to send a message
// - the worker sends guidMessage to master
// - master inserts it into the database, assigns it an id
// - master broadcasts guidMessage to all workers
// - all workers receive guidMessage and they update their cache
// - all workers service their wait queue

function master() {
    var nextId = 1,
        chatdb = require('./chatserverdb'),
        broadcastSender = ipc.makeMasterBroadcastSender(guidMessage);
    
    ipc.masterMessageReceiver(guidPrimeCache, function(msg, worker) {
        chatdb.getLatest().then(function(records) {
            msg.records = records;
            worker.send(msg);
        });
    });
    
    ipc.masterMessageReceiver(guidMessage, function(msg, worker) {
        chatdb.insertMessage(msg)
            .then(function(ins) {
                msg.record.id = ins.id;
                broadcastSender(msg);
            });
    });
};

function worker(cluster, app, jsonParser) {
    console.log(cluster.worker.id, 'starting chat server worker');
    
    var waitQueue = [],
        sendMessageToMaster = ipc.makeWorkerSender(guidMessage),
        requestPrimeCache = ipc.makeWorkerSender(guidPrimeCache),
        messages = [],
        nextId = 1,
        defaultLimit = 1024,
        messageLimit = 4096,
        nextUniqueUsername = Date.now() - 1464414604408;
    
    ipc.workerReceiver(guidMessage, function(msg) {
        appendRecord(msg.record);
        serviceWaitQueue();
    });
    
    // Prime message cache
    ipc.workerReceiver(guidPrimeCache, function(msg) {
        msg.records.sort(function(a, b) {
            var na = +a.id,
                nb = +b.id;
            return na < nb ? -1 : nb < na ? 1 : 0;
        }).forEach(function(record) {
            appendRecord(record);
        });
        serviceWaitQueue();
    });
    
    requestPrimeCache({});

    app.get('/api/wschat/message/ping', function(req, res) {
        res.send();
    });

    app.get('/api/wschat/message/stream', function(req, res) {
        var since = req.query.since && +req.query.since,
            lastMessage = messages[messages.length-1],
            waiter,
            hint;
            
        // Bad value becomes 0
        if (since !== since)
            since = 0;
        
        if (since !== undefined && 
                lastMessage &&
                lastMessage.id > since) {
            // Send response immediately
            sendMessagesSince(res, since, defaultLimit);
            return;
        }

        waiter = {
            res: res,
            since: since,
            timeout: 0
        };

        // Remember where this entry might be in the queue
        hint = waitQueue.length;
        waitQueue.push(waiter);

        res.setHeader('Connection', 'close');

        // If connection closes abruptly, remove from queue
        req.on('close', requestClosed);
        
        req.setTimeout(5 * 60 * 1000);

        // Timeout in 3.5 minutes
        waiter.timeout = setTimeout(requestTimedOut, 210000);

        function requestClosed() {
            if (waiter.timeout !== undefined) {
                clearTimeout(waiter.timeout);
                waiter.timeout = undefined;
            }

            removeFromQueue(waiter, hint);
        }
        
        function requestTimedOut() {
            waiter.timeout = undefined;
            
            if (removeFromQueue(waiter, hint))
                waiter.res.send({});
        }
    });

    app.post('/api/wschat/message/stream', jsonParser, function(req, res) {
        var recipients,
            sender = req.body.sender,
            message = req.body.message,
            record;

        record = {
            id: 0,
            timestamp: Date.now(),
            sender: sender,
            message: message
        };
        
        // Update other servers
        sendMessageToMaster({
            record: record
        });
        
        recipients = waitQueue.length;

        res.send({
            approxRecipients: recipients
        });
    });

    app.get('/api/wschat/unique-username', function(req, res) {
        res.send({
            username: 'user' + nextUniqueUsername++
        });
    });
    
    function removeFromQueue(waiter, hint) {
        if (hint === undefined || waitQueue[hint] !== waiter)
            hint = waitQueue.indexOf(waiter);
        if (hint >= 0)
            return waitQueue.splice(hint, 1);
    }
    
    function serviceWaitQueue() {
        waitQueue.splice(0, waitQueue.length).forEach(function(waiter) {
            if (waiter.timeout) {
                clearTimeout(waiter.timeout);
                waiter.timeout = undefined;
            }
            
            sendMessagesSince(waiter.res, 
                waiter.since, defaultLimit);
        });
    }
    
    function appendRecord(record) {
        messages.push(record);

        if (messages.length > messageLimit)
            messages.shift();
    }

    function sendMessagesSince(res, since, limit) {
        var lastIndex = messages.length-1,
            lastMessage = messages[lastIndex],
            index,
            end;

        if (since <= 1) {
            index = 0;
        } else {
            // Search back until we find starting point
            for (index = lastIndex; 
                index > 0 &&
                messages[index-1].id > since; 
                --index);
        }
        
        // Try to get client aligned on id that starts with
        // a multiple of 32, for maximum cache hits
        limit = since < 0 ? 64 : (((since + 64) & -64) - since);

        res.send({
            messages: messages.slice(index, index + limit)
        });
    }            
};
