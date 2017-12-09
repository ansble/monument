

const ws = require('ws')
      , events = require('harken')
      , socketHandler = require('./socketHandler');

module.exports = (server, type) => {
  const webSocketServer = new ws.Server({ server: server });

  webSocketServer.on('connection', socketHandler(type, events));
};
