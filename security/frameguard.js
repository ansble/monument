'use strict';
const utils = require('../utils')
    , reqGuard = 'X-Frame: ALLOW-FROM requires an option in config.security.frameguard parameter'
    , invalidOption = 'X-Frame must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN"'

    , allowedOptions = [ 'DENY', 'ALLOW-FROM', 'SAMEORIGIN' ]

    , actionValid = (action) => {
        const type = typeof action;

        let valid = true;

        if (type === 'undefined') {
            return valid;
        }

        if (type === 'string') {
            if (utils.not(utils.contains(allowedOptions, action.toUpperCase()))) {
                valid = false;
            }
        } else {
            valid = false;
        }


        return valid;
    }

    , headerValid = (header, domain) => {
        let valid = header === 'ALLOW-FROM' && typeof domain === 'string';

        if (!valid && header !== 'ALLOW-FROM') {
            valid = true;
        }

        return valid;
    }

    , setHeader = (header, domain) => {
        const allowFromError = () => {
            throw new Error(reqGuard);
        };

        let headerValue = '';

        if (headerValid(header, domain)) {
            if (header === 'ALLOW-FROM') {
                headerValue = `ALLOW-FROM ${domain}`;
            } else {
                headerValue = header;
            }
        } else {
            allowFromError();
        }

        return headerValue;
    };

module.exports = (config, res) => {
    const options = config.security.frameguard || {}
        , typeError = () => {
            throw new Error(invalidOption);
        };


    let header = 'SAMEORIGIN';

    if (utils.not(actionValid(options.action))) {
        typeError();
    }

    if (options.action) {
        header = options.action.toUpperCase();
    }

    header = setHeader(header, options.domain);

    res.setHeader('X-Frame-Options', header);

    return res;
};
