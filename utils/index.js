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
    , not: tools.not
    , setup: (config) => {
        const setupSteps = events.required(['setup:start'], () => {
            events.emit('setup:complete');
        });

            //execute all of the setup tasks in the setup obejct
            //  not functionally pure... has sideeffects in the file system
            //  sorry world
        Object.keys(setup).forEach((key) => {
            if(typeof setup[key] === 'function'){
                setupSteps.add('setup:' + key);
                setup[key](config);
            }
        });

        events.emit('setup:start');
    }
};
