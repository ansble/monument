'use strict';

const ws = require('ws')
    , socketHandler = require('./socketHandler');

module.exports = (server, type) => {
    const webSocketServer = new ws.Server({ server: server });

    webSocketServer.on('connection', socketHandler(type));
};
