'use strict';
const eventStore = require('../store');

module.exports = (eventName) => {
  return eventStore[eventName];
};
