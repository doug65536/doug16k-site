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
module.exports.getSomeFromId = getSomeFromId;
module.exports.getOlderById = getOlderById;

function insertMessage(msg) {
    return ChatMessage.create(msg.record, {
        raw: true
    });
}

function getLatest(limit) {
    return ChatMessage.findAll({
        order: 'id DESC',
        offset: 0,
        limit: limit,
        raw: true
    });
}

// Returns limit records where id >= `id`
function getSomeFromId(id, limit) {
    return ChatMessage.findAll({
        where: {
            id: {
                gte: id
            }
        },
        order: 'id DESC',
        offset: 0,
        limit: limit,
        raw: true
    });
}

// Returns limit records where id < `id`
function getOlderById(id, limit) {
    return ChatMessage.findAll({
        where: {
            id: {
                lt: id
            }
        },
        order: 'id DESC',
        offset: 0,
        limit: limit,
        raw: true
    });
}
