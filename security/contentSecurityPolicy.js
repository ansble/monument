'use strict';

const platform = require('platform')
    , cspBuilder = require('content-security-policy-builder')
    , isString = (item) => {
        return typeof item === 'string';
    }

    , contains = require('../utils').contains

    , config = require('./contentSecurityPolicyConfig')
    , browserHandlers = require('./contentSecurityPolicyBrowserHandlers.js')
    , pick = require('lodash.pick')

    , checkOptions = (options) => {
        if (options.reportOnly && !options.reportUri) {
            throw new Error('Please remove reportOnly or add a report-uri.');
        }

        Object.keys(options).forEach((key) => {
            const value = options[key];

            if (isString(value)) {
                value = value.trim().split(/\s+/);
            } else if (!Array.isArray(value)) {
                return;
            }

            config.mustBeQuoted.forEach((mustBeQuoted) => {
                if (contains(value, mustBeQuoted)) {
                    throw new Error(`${mustBeQuoted} must be quoted.`);
                }
            });
        });
    };

module.exports = (passedOptions) => {
    const options = passedOptions || { defaultSrc: `'self'` };

    let directives;

    checkOptions(options);
    directives = pick(options, config.supportedDirectives);

    return (req, res) => {
        const browser = platform.parse(req.headers['user-agent'])
            , browserHandler = browserHandlers[browser.name] || browserHandlers.default
            , headerData = browserHandler(browser, directives, options);

        let policyString;

        if (options.setAllHeaders) {
            headerData.headers = config.allHeaders;
        }

        headerData.directives = headerData.directives || directives;

        if (headerData.headers.length) {
            policyString = cspBuilder({ directives: headerData.directives });
        }

        headerData.headers.forEach((header) => {
            let headerName = header;

            if (options.reportOnly) {
                headerName += '-Report-Only';
            }
            res.setHeader(headerName, policyString);
        });

        return res;
    };
};
