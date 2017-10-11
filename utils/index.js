'use strict';

const getCompression = require('./getCompression')
      , send = require('./send')
      , redirect = require('./redirect')
      , setup = require('./setup')
      , parsePath = require('./url')
      , events = require('harken')
      , tools = require('./tools');

module.exports = {
  getCompression: getCompression
  , send: send
  , redirect: redirect
  , parsePath: parsePath
  , isDefined: tools.isDefined
  , isUndefined: tools.isUndefined
  , not: tools.not
  , contains: tools.contains
  , setup: (config) => {
    const logger = config.log
          , setupSteps = events.required([ 'setup:start' ], () => {
            events.emit('setup:complete');
          });

    // execute all of the setup tasks in the setup obejct
    //  not functionally pure... has sideeffects in the file system
    //  sorry world
    Object.keys(setup).forEach((key) => {
      setupSteps.add(`setup:${key}`);
      setup[key](config);
    });

    // Check for statsd and message it out
    if (config.statsd) {
      logger.info(`
Awesome you're statsd config is running!
Connected to statsd at ${config.statsd.host}:${config.statsd.port}
`);
    }

    events.emit('setup:start');
  }
};
