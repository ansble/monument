'use strict';

const isDefined = require('../utils').isDefined;


module.exports = (config, res) => {
    if (isDefined(config.security) && isDefined(config.security.noSniff) && config.security.noSniff === false) {
        return res;
    } else {
        res.setHeader('X-Content-Type-Options', 'nosniff');

        return res;
    }
};
