"use strict";

var Sequelize = require('sequelize'),
    util = require('./util'),
    authdb = require('./authdb'),
    dbconfig = require('./chatserverconfig'),
    db,
    ChatRoom,
    ChatMessage;

db = new Sequelize(
    dbconfig.chatMsg.database,
    dbconfig.chatMsg.username, 
    dbconfig.chatMsg.password,
    dbconfig.chatMsg.options);

ChatRoom = db.define('room', {
    id: {
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING(20)
    }
});

//ChatRoom.belongsTo(authdb.db.User);

ChatMessage = db.define('chatmsg', {
    id: {
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true
    },
    sender: {
        type: Sequelize.STRING(64)
    },
    message: {
        type: Sequelize.STRING(4000)
    }
});

ChatMessage.belongsTo(ChatMessage, {
    as: 'replyTo'
});

ChatMessage.belongsTo(ChatRoom, {
    unique: ['id', 'roomId']
});

module.exports.insertMessage = insertMessage;
module.exports.getLatest = getLatest;
module.exports.getSomeFromId = getSomeFromId;
module.exports.getOlderById = getOlderById;
module.exports.createRoom = createRoom;
module.exports.getRooms = getRooms;
module.exports.getRoom = getRoom;
module.exports.sync = sync;
module.exports.createDefaultRoom = createDefaultRoom;

function sync(force) {
    return db.sync({force: force});
}

function createDefaultRoom() {
    return ChatRoom.create({
        name: 'default'
    });
}

function getRooms(offset, limit) {
    return ChatRoom.findAll({
        offset: offset,
        limit: limit,
        raw: true
    }).catch(util.makeErrorDumper('getRooms'));
}

function getRoom(room) {
    return ChatRoom.findOne({
        where: {
            id: +room
        },
        raw: true
    }).catch(util.makeErrorDumper('getRoom ' + +room));
}

function createRoom(owner, name) {
    console.log('createRoom wtf', arguments);
    return ChatRoom.create({
        name: name,
        user: owner
    }).then(function(record) {
        return record.get('id');
    }).then(util.makeResultDumper('createRoom'),
        util.makeErrorDumper('createRoom'));
}

function insertMessage(msg) {
    //console.log('insert msg', msg);
    return ChatMessage.create(msg.record).then(function(record) {
        return record.toJSON();
    }).then(util.makeResultDumper('insertMessage'),
        util.makeErrorDumper('insertMessage'));
}

function getLatest(room, limit) {
    //console.log('getting latest for room', typeof room, room);
    return ChatMessage.findAll({
        order: 'id DESC',
        offset: 0,
        limit: limit*4,
        raw: true,
        include: [
            {
                model: ChatRoom,
                attributes: []
            }
        ],
        where: {
            roomId: room
        }
    }).then(function(records) {
        return records.reverse().slice(0, limit);
    }).catch(util.makeErrorDumper('getLatest'));
}

// Returns limit records where id >= `id`
function getSomeFromId(room, id, limit) {
    if (id < 0) {
        //console.log('getting latest');
        return getLatest(room, limit);
    }
    
    return ChatMessage.findAll({
        where: {
            roomId: room,
            id: {
                $gt: id
            }
        },
        include: [
            {
                model: ChatRoom, 
                attributes: []
            }
        ],
        order: 'room,id DESC',
        offset: 0,
        limit: limit,
        raw: true
    }).then(function(records) {
        return records.reverse();
    }).catch(util.makeErrorDumper('getSomeFromId'));
}

// Returns limit records where id < `id`
function getOlderById(room, id, limit) {
    return ChatMessage.findAll({
        where: {
            roomId: {
                eq: room
            },
            id: {
                lt: id
            }
        },
        order: 'id DESC',
        offset: 0,
        limit: limit,
        raw: true
    }).then(function(records) {
        return records.reverse();
    });
}

