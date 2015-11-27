'use strict';

const ws = require('ws')
    , events = require('harken')
    , not = require('../utils').not
    , isDefined = require('../utils').isDefined

    , isPassThrough = (event, setEvent) => {
        return event === setEvent;
    }

    , isDataEvent = (event, setEvent) => {
        return not(isPassThrough(event, setEvent));
    };

module.exports = (server, type) => {
    const webSocketServer = new ws.Server({ server: server });

    webSocketServer.on('connection', (socket) => {
        socket.onmessage = (messageIn) => {
            const message = JSON.parse(messageIn.data)
                , setEvent = message.event.replace(':get:', ':set:');

            if (!type || not(isDefined(message.event))) {
                // no event then we can't really do anything...
                return;
            }

            if (type && type !== 'passthrough' && isDataEvent(message.event, setEvent)) {
                events.on(setEvent, (data) => {

                    socket.send({ event: setEvent, data: JSON.stringify(data) }, (err) => {
                        console.warn(err);
                    });
                });

                events.emit(message.event);
            } else if (type && type !== 'data') {
                // passthrough
                events.emit(message.event, { message: message, socket: socket });
            }
        };
    });
};
