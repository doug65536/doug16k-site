"use strict";

var Sequelize = require('sequelize'),
    dbconfig = require('./chatserverconfig'),
    db,
    ChatMessage;

db = new Sequelize(
    dbconfig.chatMsg.database,
    dbconfig.chatMsg.username, 
    dbconfig.chatMsg.password,
    dbconfig.chatMsg.options);

db.sync({force: false});

ChatMessage = db.define('chatmsg', {
    id: {
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true
    },
    sender: Sequelize.STRING(64),
    message: Sequelize.STRING(4000)
});

module.exports.insertMessage = insertMessage;
module.exports.getLatest = getLatest;

function insertMessage(msg) {
    return ChatMessage.create(msg.record, {
        raw: true
    }).then(function(ins) {
        //console.log('inserted', ins);
        return ins;
    });
}

function getLatest() {
    return ChatMessage.findAll({
        order: 'id DESC',
        offset: 0,
        limit: 1024,
        raw: true
    });
}
