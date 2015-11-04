'use strict';

const oneDay = 86400
    , isDefined = require('../utils').isDefined
    , hasOptions = (config) => {
        return isDefined(config.security) && isDefined(config.security.hsts);
    };

module.exports = (config, res) => {
    const hstsOptions = hasOptions(config) ? config.security.hsts : {}
        , maxAge = isDefined(hstsOptions.maxAge) ? hstsOptions.maxAge : oneDay;

    let header = '';

    if (hstsOptions !== false) {
        if (maxAge < 0) {
            throw new Error('maxAge must be a positive number of seconds for the HSTS header');
        }

        if (typeof maxAge !== 'number'){
            throw new Error('maxAge must be a number for the HSTS header');
        }

        header = `max-age=${maxAge}`;

        if (hstsOptions.includeSubDomains !== false) {
            header += '; includeSubdomains';
        }

        if (hstsOptions.preload !== false) {
            header += '; preload';
        }

        res.setHeader('Strict-Transport-Security', header);
    }

    return res;
};
