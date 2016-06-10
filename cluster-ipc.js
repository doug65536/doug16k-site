"use strict";

var cluster = require('cluster');

module.exports.masterMessageReceiver = masterMessageReceiver;
module.exports.masterBroadcastReceiverCleanup = masterBroadcastReceiverCleanup;
module.exports.masterRepeater = masterRepeater;
module.exports.makeMasterBroadcastSender = makeMasterBroadcastSender;
module.exports.makeWorkerSender = makeWorkerSender;
module.exports.workerReceiver = workerReceiver;

// Listen for messages with matching guid from worker in master
function masterMessageReceiver(guid, callback, thisArg) {
    // Create a listener for every 
    return Object.keys(cluster.workers).map(function(key) {
        var worker = this[key];
        worker.on('message', masterMessageReceiverHandler);
        
        return {
            handler: masterMessageReceiverHandler,
            worker: worker
        };
        
        function masterMessageReceiverHandler(msg) {
            if (msg.guid && msg.guid === guid)
                callback.call(thisArg, msg, worker);
        }
    }, cluster.workers);
};

// Remove the handler registered by masterMessageReceiver
function masterBroadcastReceiverCleanup(values) {
    values.forEach(function(value) {
        value.worker.off('message', value.handler);
    });
}

function makeMasterBroadcastSender(msg, options) {
    options = options || {};
    return function(msg) {
        var workers = cluster.workers;

        Object.keys(workers).forEach(function(key) {
            var worker = this[key];
            if (worker.id !== msg.sender.id || !options.noecho)
                worker.send(msg);
        }, workers);
    };
}

function masterRepeater(guid, echo, filter, thisArg) {
    console.log('preparing repeater');
    
    masterMessageReceiver(guid, function(msg, worker) {
        console.log('got master message in master');
        
        var workers;

        if (typeof msg !== 'object' || msg.guid !== guid) {
            console.log('master repeater dropped', msg);
            return;
        }
        
        // Pass the message to the filter function 
        // for possible modification
        if (!filter || filter.call(thisArg, msg) !== false) {
            workers = cluster.workers;

            Object.keys(workers).forEach(function(key) {
                var worker = this[key];
                if (worker.id !== msg.sender.id && echo)
                    worker.send(msg);
            }, workers);
        }
    });
};

function makeMasterBroadcastSender(guid, options) {
    options = options || {};
    return function(msg) {
        var workers = cluster.workers;
        Object.keys(workers).forEach(function(key) {
            var worker = this[key];
            if (worker.id !== msg.sender.id && !options.noecho)
                worker.send(msg);
        }, workers);
    };
}

function makeWorkerSender(guid) {
    return function(msg) {
        //console.log('broadcasting', msg);

        if (typeof msg !== 'object')
            throw new Error('Must send object');
        
        // Add guid and sender properties
        msg.guid = guid;
        msg.sender = cluster.worker.id;
        
        process.send(msg);
    };
};

function workerReceiver(guid, callback, thisArg) {
    process.on('message', masterMessageReceiverHandler);
    
    function masterMessageReceiverHandler(msg) {
        if (typeof msg !== 'object' || msg.guid !== guid)
            return;
        
        callback.call(thisArg, msg);
    }
};

