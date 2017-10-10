'use strict';

const eventStore = require('../store')
      , emptyScope = {}
      , compare = require('../compare')

      , getEventSettings = (eventNameIn, handlerIn, scopeIn, onceIn) => { // eslint-disable-line max-params
        // attribute holders and such
        const scope = scopeIn || emptyScope
              , once = onceIn || false
              , isObject = typeof eventNameIn === 'object';

        return {
          name: isObject ? eventNameIn.eventName : eventNameIn
          , handler: isObject ? eventNameIn.handler : handlerIn
          , scope: isObject && typeof eventNameIn.scope !== 'undefined' ? eventNameIn.scope : scope
          , once: isObject && typeof eventNameIn.once !== 'undefined' ? eventNameIn.once : once
        };
      }

      , on = (eventNameIn, handlerIn, scopeIn, onceIn) => { // eslint-disable-line max-params
        const eventSettings = getEventSettings(eventNameIn, handlerIn, scopeIn, onceIn)
              , eventStack = eventStore[eventSettings.name];

        let newCheck;

        if (Array.isArray(eventStack)) {
          // already exists check to see if the function is already bound
          //  using .find here to speed up detection of matchs
          //  .find gets returned as soon as it returns true
          //  the downside to this decision is it returns the object and not a bool
          //  I think the upside beats the downside of the comparison below
          //  especially as the size of the stack grows.
          newCheck = eventStack.find((listener) => {
            return compare(eventSettings.handler, listener.call)
                  && compare(eventSettings.once, listener.once)
                  && compare(eventSettings.scope, listener.scope);
          });

          if (typeof newCheck !== 'object') {
            eventStack.push({
              once: eventSettings.once
              , call: eventSettings.handler
              , scope: eventSettings.scope
              , created: new Date()
            });
          }

        } else {
          // new event
          eventStore[eventSettings.name] = [
            {
              once: eventSettings.once
              , call: eventSettings.handler
              , scope: eventSettings.scope
              , created: new Date()
            }
          ];
        }
      };

module.exports = on;
