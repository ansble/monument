'use strict';
const events = require('harken')
    , isUndefined = require('../utils').isUndefined

    , isDataEvent = (event, setEvent) => {
        return event !== setEvent;
    }

    , getMessage = (dataIn) => {
        try {
            return JSON.parse(dataIn);
        } catch (err) {
            return {};
        }
    };

module.exports = (type) => {
    return (socket) => {
        socket.onmessage = (messageIn) => {
            const message = getMessage(messageIn.data)
                , setEvent = message.event && message.event.replace ?
                                    message.event.replace(':get:', ':set:') : '';

            if (!type || isUndefined(message.event)) {
                // no event then we can't really do anything...
                return;
            }

            if (type && type !== 'passthrough' && isDataEvent(message.event, setEvent)) {
                events.on(setEvent, (data) => {

                    socket.send({ event: setEvent, data: JSON.stringify(data) }, (err) => {
                        events.emit('error:ws', { inboundMessage: message, error: err });
                        console.warn(err);
                    });
                });

                events.emit(message.event);
            } else if (type && type !== 'data') {
                // passthrough
                events.emit(message.event, { message: message, socket: socket });
            }
        };
    };
};
