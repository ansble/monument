'use strict';
const isUndefined = require('../utils').isUndefined
      , isDataEvent = (event, setEvent) => {
        return event !== setEvent;
      }

      , getMessage = (dataIn) => {
        try {
          return JSON.parse(dataIn);
        } catch (err) {
          return {};
        }
      }
      , getSetEventString = (message) => {
        const shouldReplace = message.event && message.event.replace;

        return shouldReplace ? message.event.replace(':get:', ':set:') : '';
      };

module.exports = (type, events) => {
  return (socket) => {
    socket.onmessage = (messageIn) => {
      const message = getMessage(messageIn.data)
            , setEvent = getSetEventString(message);


      if (!type || isUndefined(message.event)) {
        return;
      }

      if (type && type !== 'passthrough' && isDataEvent(message.event, setEvent)) {
        events.on(setEvent, (data) => {
          console.log('HERE WE GOOOOOOOOOO', socket.send);
          socket.send(JSON.stringify({ event: setEvent, data: data }), (err) => {
            if (err) {
              events.emit('error:ws', { inboundMessage: message, error: err });
              console.warn(err);
            }
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
