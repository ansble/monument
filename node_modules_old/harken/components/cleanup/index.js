'use strict';

const eventStore = require('../store')
      , off = require('../off')

      , cleanup = () => {
        Object.keys(eventStore).forEach((event) => {
          eventStore[event].forEach((item) => {
            if (item.once && item.created.getTime() + 1200000 <= new Date().getTime()) {
              off({
                eventName: event
                , scope: item.scope
                , handler: item.call
                , once: item.once
              });
            }
          });
        });
      };

module.exports = cleanup;
