"use strict";


var Promise = require('bluebird'),
    crypto = require('crypto'),
    Sequelize = require('sequelize'),
    dbconfig = require('./chatserverconfig'),
    db,
    Name,
    User,
    Session;

db = new Sequelize(
    dbconfig.chatMsg.database,
    dbconfig.chatMsg.username, 
    dbconfig.chatMsg.password,
    dbconfig.chatMsg.options);

User = db.define('user', {
    id: {
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true
    },
    
    username: {
        unique: true,
        type: Sequelize.STRING(32)
    },
    
    // 384-bit (48 byte) random number
    salt: Sequelize.CHAR(64),
    
    // 384-bit (48 byte) base 64 sha256 262139 round pbkdf2
    password: Sequelize.CHAR(64),
    
    email: Sequelize.STRING(254),
    verified: Sequelize.BOOLEAN,
    
    // 384-bit (48 byte) base64 verify account token
    verifytoken: Sequelize.CHAR(64)
});

Session = db.define('session', {
    id: {
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true
    },
    expires: Sequelize.DATE
});

Session.hasOne(User);

db.sync({
    force: false
});

var pbkdfRounds = 262139,
    pbkdfLength = 384>>3,
    pbkdfDigest = 'sha256';

module.exports = {
    // For associations
    db: {
        User: User,
        Session: Session
    },
    
    // Returns a promise that resolves to true or false
    checkPassword: function(username, password) {
        var record,
            saltData;
        
        return User.findOne({
            where: {
                username: username
            }
        }).then(function(foundRecord) {
            record = foundRecord;
            
            // Introduce a long delay when record not found
            if (!record)
                return delayedResponse(false, 780 + Math.random() * 300 - 150);
            
            saltData = new Buffer(record.salt, 'base64');
            
            return pbkdf2Async(password, saltData, 
                pbkdfRounds, pbkdfLength, pbkdfDigest);
        }).then(function(hash) {
            // If record was not found, introduce a delay            
            return record.password === hash;
        });
    },
    
    // Returns promise that resolves to user id
    createUser: function(username, password, email) {
        var saltBuffer;
        
        return randomBytesAsync(48).then(function(random) {
            saltBuffer = random;
        }).then(function() {
            return pbkdf2Async(password, saltBuffer,
                pbkdfRounds, pbkdfLength, pbkdfDigest);
        }).then(function(hashBuffer) {
            return User.create({
                username: username,
                password: hashBuffer.toString('base64'),
                salt: saltBuffer.toString('base64'),
                email: email || ''
            });
        }).then(function(user) {
            return user.id;
        });
    },
    
    sendForgotEmail: function(email) {
        
    }
};

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

function throwAuthError(message) {
    throw new Error(message || 'Autentication failed');
}

function delayedResult(result, delay) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, delay, result);
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
