"use strict";

var cluster = require('cluster'),
    serverModule = require('./worker');

if (cluster.isMaster) {
    serverModule.master();
} else {
    serverModule.worker();
}
