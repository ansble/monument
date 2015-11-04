'use strict';
const missingConfigError = new Error('You must provide at least 2 SHA-256s and a maxAge argument to use Public Key Pinning. How To: http://mzl.la/1EnfqBf, http://bit.ly/1WkHcWs Spec: http://bit.ly/1kVy0MR')
    , isDefined = require('../utils').isDefined
    , not = require('../utils').not
    , shapeCheck = (options) => {

        if (not(isDefined(options.maxAge)) ||
            not(isDefined(options.sha256s)) ||
            options.sha256s.length < 2 ||
            options.maxAge <= 0) {

            throw missingConfigError;
        }

        return true;
    }

    , hasOptions = (config) => {
        return isDefined(config.security) && isDefined(config.security.publicKeyPin);
    };

let headerKey = 'Public-Key-Pins'
    , headerValue = '';


module.exports = (config, res, force) => {
    const options = hasOptions(config) ? config.security.publicKeyPin : undefined;

    // only do things if the user wants it. This option is complex
    //  and because of that it defaults to off. Also because the
    //  consequences for getting it wrong are catastrophic to a site.
    if (hasOptions(config)){
        if ((headerValue === '' || force) && shapeCheck(options)) {
            // all the needed params are there and we haven't set up yet
            if (force) {
                headerKey = 'Public-Key-Pins';
            }

            headerValue = options.sha256s.map((key) => {
                return `pin-sha256="${key}"`;
            }).join('; ');

            headerValue += `; max-age=${options.maxAge}`;

            if (options.includeSubdomains) {
                headerValue += '; includeSubdomains';
            }

            if (isDefined(options.reportUri) && options.reportUri) {
                if (not(isDefined(options.reportOnly)) || options.reportOnly) {
                    headerKey += '-Report-Only';
                }

                headerValue += `; report-uri="${options.reportUri}"`;
            }
        }

        res.setHeader(headerKey, headerValue);
    }

    return res;
};
