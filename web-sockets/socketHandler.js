'use strict';
const events = require('harken')
    , isUndefined = require('../utils').isUndefined

    , isDataEvent = (event, setEvent) => {
        return event !== setEvent;
    };

module.exports = (type) => {
    return (socket) => {
        socket.onmessage = (messageIn) => {
            const message = JSON.parse(messageIn.data)
                , setEvent = message.event.replace(':get:', ':set:');

            if (!type || isUndefined(message.event)) {
                // no event then we can't really do anything...
                return;
            }

            if (type && type !== 'passthrough' && isDataEvent(message.event, setEvent)) {
                events.on(setEvent, (data) => {
                    // set "event" property with new value equal to "setEvent"
                    data.event = setEvent;
                    socket.send(JSON.stringify(data), (err) => {
                        if(err) console.warn(err);
                    });
                });

                events.emit(setEvent, message);
            } else if (type && type !== 'data') {
                // passthrough
                events.emit(message.event, { message: message, socket: socket });
            }
        };
    };
};
