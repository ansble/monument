'use strict';

const on = require('./components/on')
      , off = require('./components/off');

module.exports = {
  emit: require('./components/emit')

  , cleanup: require('./components/cleanup')
  , listeners: require('./components/listeners')

  , required: require('event-state')

  , on: on
  , addListener: on
  , once: (eventNameIn, handlerIn, scopeIn) => {
    // same thing as .on() but is only triggered once
    if (typeof eventNameIn === 'object') {
      eventNameIn.once = true; // eslint-disable-line no-param-reassign
      on(eventNameIn);
    } else {
      on({
        eventName: eventNameIn
        , handler: handlerIn
        , scope: scopeIn
        , once: true
      });
    }
  }

  , off: off
  , removeListener: off
  , removeAllListeners: (eventNameIn) => {
    off(eventNameIn);
  }
};
