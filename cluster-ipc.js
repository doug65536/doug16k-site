"use strict";

var cluster = require('cluster');

module.exports.masterMessageReceiver = masterMessageReceiver;
module.exports.masterBroadcastReceiverCleanup = masterBroadcastReceiverCleanup;
module.exports.masterRepeater = masterRepeater;
module.exports.makeMasterBroadcastSender = makeMasterBroadcastSender;
module.exports.makeWorkerSender = makeWorkerSender;
module.exports.workerReceiver = workerReceiver;

function stackTrace() {
    try {
        throw new Error('stack trace');
    } catch (err) {
        console.log('stack', err.stack);
    }
}

// Listen for messages with matching guid from worker in master
function masterMessageReceiver(guid, callback, thisArg) {
    console.log('starting master message receiver', guid);
    console.log('had ' + Object.keys(cluster.workers).length + ' workers');

    var listeners = [],
        workers = [];
    
    Object.keys(cluster.workers).forEach(function(key) {
        console.log('initially listening to worker', key);
        listenTo(this[key]);
    }, cluster.workers);
    
    cluster.on('online', listenTo);
    
    function listenTo(worker) {
        console.log('listening to worker', worker.id);
        
        var i = workers.indexOf(worker),
            onMessage = injectArg(1, worker, callback, thisArg),
            onDisc = injectArg(0, worker, stopListeningTo);
        
        if (i < 0) {
            console.assert(workers.length === listeners.length);
            
            workers.push(worker);
            listeners.push({
                message: onMessage,
                disconnect: onDisc
            });
            
            worker.on('message', onMessage);
            worker.on('disconnect', onDisc)
        } else {
            console.log('ignored duplicate worker');
        }
    }
    
    function stopListeningTo(worker) {
        var i = workers.indexOf(worker),
            listener;
        if (i < 0)
            return;
        
        workers.splice(i, 1);
        listener = listeners.splice(i, 1);
        
        // wtf
        //Object.keys(listener).forEach(function(eventName) {
        //    worker.removeEventListener(eventName, this[eventName]);
        //}, listener);
    }
    
    function injectArg(place, arg, callback, thisArg) {
        return function(msg) {
            console.log('master got message', msg);
            var args = Array.prototype.slice.call(arguments);
            args.splice(place, 1, arg);
            callback.apply(thisArg, args);
        };
    }
}

// Remove the handler registered by masterMessageReceiver
function masterBroadcastReceiverCleanup(values) {
    values.forEach(function(value) {
        value.worker.removeEventListener('message', value.handler);
    });
}

//function makeMasterBroadcastSender(msg, options) {
//    options = options || {};
//    return function(msg) {
//        var workers = cluster.workers;
//
//        Object.keys(workers).forEach(function(key) {
//            var worker = this[key];
//            if (worker.id !== msg.sender.id || !options.noecho)
//                worker.send(msg);
//        }, workers);
//    };
//}

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
}

function makeMasterBroadcastSender(guid, options) {
    options = options || {};
    
    return function(msg) {
        var workers = cluster.workers;
        console.log('broadcasting', msg, 'to', 
            Object.keys(workers).length);
        Object.keys(workers).forEach(function(key) {
            var worker = this[key];
            if (!options.noecho || worker.id !== msg.sender.id) {
                console.log('...to', key);
                msg.guid = guid;
                msg.sender = 0;
                worker.send(msg);
            }
        }, workers);
    };
}

function makeWorkerSender(guid) {
    return function(msg) {
        if (typeof msg !== 'object')
            throw new Error('Must send object');
        
        console.log('sending to master', msg);

        // Add guid and sender properties
        msg.guid = guid;
        msg.sender = cluster.worker.id;
        
        process.send(msg);
    };
}

function workerReceiver(guid, callback, thisArg) {
    process.on('message', workerMessageReceiverHandler);
    
    function workerMessageReceiverHandler(msg) {
        if (typeof msg !== 'object' || msg.guid !== guid)
            return;

        console.log('worker dispatching received message');
        
        callback.call(thisArg, msg);
    }
}

