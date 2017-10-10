'use strict';

const eventStore = require('../store')
      , off = require('../off')
      , flush = () => {
        Object.keys(eventStore).forEach((event) => {
          off(event);
        });
      };

module.exports = flush;
