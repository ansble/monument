'use strict';

const platform = require('platform')
    , cspBuilder = require('content-security-policy-builder')
    , isString = (item) => {
        return typeof item === 'string';
    }

    , contains = require('../utils').contains

    , policyConfig = require('./contentSecurityPolicyConfig')
    , browserHandlers = require('./contentSecurityPolicyBrowserHandlers.js')
    , pick = require('lodash.pick')

    , checkOptions = (options) => {
        if (options.reportOnly && !options.reportUri) {
            throw new Error('Please remove reportOnly or add a report-uri.');
        }

        Object.keys(options).forEach((key) => {
            let value = options[key];

            if (isString(value)) {
                value = value.trim().split(/\s+/);
            } else if (!Array.isArray(value)) {
                return;
            }

            policyConfig.mustBeQuoted.forEach((mustBeQuoted) => {
                if (contains(value, mustBeQuoted)) {
                    throw new Error(`${mustBeQuoted} must be quoted.`);
                }
            });
        });
    }

    , getSettings = (settings) => {
        return settings || { defaultSrc: `'self'` };
    }

    , getHandler = (browser) => {
        return browserHandlers[browser.name] || browserHandlers.default;
    };

module.exports = (config, req, res) => {
    const settings = getSettings(config.security.contentSecurity)
        , browser = platform.parse(req.headers['User-Agent'])
        , handler = getHandler(browser)
        , directives = pick(settings, policyConfig.supportedDirectives)
        , headerData = handler(browser, directives, settings);

    let policyString;

    checkOptions(settings);

    if (settings.setAllHeaders) {
        headerData.headers = policyConfig.allHeaders;
    }

    if (headerData.headers.length) {
        policyString = cspBuilder({ directives: headerData.directives || directives });
    }

    headerData.headers.forEach((header) => {
        let headerName = header;

        if (settings.reportOnly) {
            headerName += '-Report-Only';
        }
        res.setHeader(headerName, policyString);
    });

    return res;
};
