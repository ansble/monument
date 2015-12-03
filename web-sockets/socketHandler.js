'use strict';
const events = require('harken')
    , not = require('../utils').not
    , isDefined = require('../utils').isDefined

    // , isPassThrough = (event, setEvent) => {
    //     return event === setEvent;
    // }

    , isDataEvent = (event, setEvent) => {
        return event !== setEvent;
    };

module.exports = (type) => {

    return (socket) => {
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
    };
};
