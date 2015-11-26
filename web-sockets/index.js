'use strict';

const ws = require('ws')
    , events = require('harken');

module.exports = (server) => {
    const webSocketServer = new ws.Server({ server: server });

    webSocketServer.on('connection', (socket) => {
        socket.onmessage = (event) => {
            const setEvent = event.data.replace(':get:', ':set:');

            events.on(setEvent, (data) => {

                socket.send(JSON.stringify(data), (err) => {
                    console.warn(err);
                });
            });

            events.emit(event.data);
        };
    });
};
