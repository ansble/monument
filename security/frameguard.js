'use strict';

module.exports = (config, res) => {
    const options = config.security.frameguard || {}
        , type = typeof options.action
        , typeError = () => {
            throw new Error('X-Frame must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN"');
        };

    let header = 'SAMEORIGIN';


    if (type === 'undefined' || type === 'string') {
        if(type === 'string' && ['DENY', 'ALLOW-FROM', 'SAMEORIGIN'].indexOf(options.action.toUpperCase()) === -1) {
            typeError();
        }
    } else {
        typeError();
    }

    if(options.action) {
        header = options.action.toUpperCase();
    }

    if (header === 'ALLOW-FROM') {
        if (typeof options.domain !== 'string') {
            throw new Error('X-Frame: ALLOW-FROM requires an option in config.security.frameguard parameter');
        }

        header = 'ALLOW-FROM ' + options.domain;
    }

    res.setHeader('X-Frame-Options', header);

    return res;
};
