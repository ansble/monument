'use strict';
const events = require('harken')
      , isUndefined = require('../utils').isUndefined
      , socketUtils = require('./utils')
      , logger = require('../utils/config').get('log');

module.exports = (type) => {
  return (socketIn) => {
    const socket = socketIn;

    socket.onmessage = (messageIn) => {
      const message = socketUtils.getMessage(messageIn.data)
            , setEvent = socketUtils.getSetEventString(message);

      if (!type || isUndefined(message.event)) {
        // no event then we can't really do anything...
        return;
      }

      if (type && type !== 'passthrough' && socketUtils.isDataEvent(message.event, setEvent)) {
        events.on(setEvent, (data) => {
          socket.send(JSON.stringify({ event: setEvent, data: data }), (err) => {
            if (err) {
              events.emit('error:ws', { inboundMessage: message, error: err });
              logger.warn(err);
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
