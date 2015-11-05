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
    }

    , hasReportUri = (options) => {
        return isDefined(options.reportUri) && options.reportUri;
    }

    , hasReportOnly = (options) => {
        return not(isDefined(options.reportOnly)) || options.reportOnly;
    }

    , addSubdomainFlag = (headerValueIn, options) => {
        let headerValue = headerValueIn;

        if (options.includeSubdomains) {
            headerValue += '; includeSubdomains';
        }

        return headerValue;
    }

    , addReportUri = (headerValueIn, options) => {
        let headerValue = headerValueIn;

        if (hasReportUri(options)) {
            headerValue += `; report-uri="${options.reportUri}"`;
        }

        return headerValue;
    }

    , setHeaderKey = (options, force) => {
        let headerKey = 'Public-Key-Pins';

        if (force) {
            headerKey = 'Public-Key-Pins';
        }

        if (hasReportUri(options) && hasReportOnly(options)) {
            headerKey += '-Report-Only';
        }

        return headerKey;
    };

let headerKey = 'Public-Key-Pins'
    , headerValue = '';


module.exports = (config, res, force) => {
    const options = hasOptions(config) ? config.security.publicKeyPin : undefined;

    // only do things if the user wants it. This option is complex
    //  and because of that it defaults to off. Also because the
    //  consequences for getting it wrong are catastrophic to a site.

    if (hasOptions(config)) {
        if ((headerValue === '' || force) && shapeCheck(options)) {
            // all the needed params are there and we haven't set up yet

            headerKey = setHeaderKey(options, force);

            headerValue = options.sha256s.map((key) => {
                return `pin-sha256="${key}"`;
            }).join('; ');

            headerValue += `; max-age=${options.maxAge}`;
            headerValue = addSubdomainFlag(headerValue, options);
            headerValue = addReportUri(headerValue, options);
        }

        res.setHeader(headerKey, headerValue);
    }


    return res;
};
