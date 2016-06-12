"use strict";

var Sequelize = require('sequelize'),
    dbconfig = require('./chatserverconfig'),
    db,
    User,
    Session;

db = new Sequelize(
    dbconfig.chatMsg.database,
    dbconfig.chatMsg.username, 
    dbconfig.chatMsg.password,
    dbconfig.chatMsg.options);

db.sync({force: false});

User = db.define('user', {
    id: {
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true
    },
    username: Sequelize.STRING(32),
    password: Sequelize.CHAR(32),
    email: Sequelize.STRING(254),
    verified: Sequelize.BOOLEAN,
    verifytoken: Sequelize.VARCHAR(32)
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
