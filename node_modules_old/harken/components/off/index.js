'use strict';

const eventStore = require('../store')
      , compare = require('../compare')

      , off = (eventNameIn, handlerIn, onceIn, scopeIn) => { // eslint-disable-line max-params
        // localize variables
        let eventName = eventNameIn
            , handler = handlerIn
            , once = onceIn
            , scope = scopeIn;

        if (typeof eventNameIn === 'object') {
          // passed in a collection of params instead of params
          eventName = eventNameIn.eventName;
          handler = eventNameIn.handler;
          once = eventNameIn.once;
          scope = eventNameIn.scope;
        }

        if (Array.isArray(eventStore[eventName])) {
          if (typeof handler === 'undefined') {
            // no function unbind everything by resetting
            eventStore[eventName] = [];
          } else {
            // there is an event that matches... proceed
            eventStore[eventName] = eventStore[eventName].filter((listener) => {
              let isMatch = compare(handler, listener.call);

              // function is passed in
              if (typeof scope !== 'undefined') {
                // scope is passed in...
                isMatch = !!(isMatch && scope);

                if (typeof once === 'boolean') {
                  // function + scope + once provides the match
                  isMatch = !!(isMatch && compare(once, listener.once));
                }
              } else if (typeof once === 'boolean') {
                isMatch = !!(isMatch && compare(once, listener.once));
              }

              return !isMatch;
            });
          }
        }
      };

module.exports = off;
