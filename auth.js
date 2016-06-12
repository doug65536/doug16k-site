"use strict";

var cluster = require('cluster'),
    crypto = require('crypto');

if (cluster.isMaster)
    module.exports.master = master;

if (cluster.isWorker)
    module.exports.worker = worker;

function master() {
    
}

function worker(cluster, app, jsonParser) {
    app.post('/api/auth', function(req, res) {
        var username = req.params.username,
            password = req.params.password;
        
        crypto.pbkdf2('secret', 'salt', 100000, 512, 'sha512', function(err, key) => {
    });
    
    app.get('/api/auth/')
}

function randomBytesAsync(bytes) {
    crypto.randomBytes()
}

function pbkdf2Async(secret, salt, iterations, keyLength, digest) {
    return new Promise(function(resolve, reject) {
        crypto.pbkdf2(secret, salt, 
            iterations, keyLength, digest, function(err, key) {
            if (!err)
                resolve(key);
            else
                reject(err);
        });
    });
}
