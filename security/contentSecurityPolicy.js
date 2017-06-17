'use strict';

const platform = require('platform')
      , cspBuilder = require('content-security-policy-builder')
      , isString = (item) => {
        return typeof item === 'string';
      }

      , contains = require('../utils').contains
      , isDefined = require('../utils').isDefined

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
            options[key] = value = value.trim().split(/\s+/);
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
        if (isDefined(settings) && isDefined(settings.contentSecurity)) {
          return settings.contentSecurity;
        } else {
          return { defaultSrc: "'self'" };
        }
      }

      , getHandler = (browser) => {
        return browserHandlers[browser.name] || browserHandlers.default;
      }

      , policyStringCache = {}

      , getPolicyString = (browser, directives) => {
        const version = parseFloat(browser.version)
              , isChromeMobile = browser.name === 'Chrome Mobile'
              , isCustomFirefox = browser.name === 'Firefox' && version < 23 && version >= 4
              , isCustom = isChromeMobile || isCustomFirefox;

        let policyString;

        if (isCustom && policyStringCache[browser.name]) {
          return policyStringCache[browser.name];
        } else if (!isChromeMobile && !isCustomFirefox && policyStringCache.default) {
          return policyStringCache.default;
        } else {
          policyString = cspBuilder({ directives: directives });

          if (isCustom) {
            policyStringCache[browser.name] = policyString;
          } else {
            policyStringCache.default = policyString;
          }

          return policyString;
        }
      }

      , splitDirectives = (directivesIn) => {
        return Object.keys(directivesIn).reduce((prev, current) => {
          if (Array.isArray(directivesIn[current])) {
            prev[current] = directivesIn[current];
          } else {
            prev[current] = directivesIn[current].split(' ');
          }

          return prev;
        }, {});
      };

module.exports = (config, req, res) => {
  const settings = getSettings(config.security)
        , browser = platform.parse(req.headers['user-agent'])
        , handler = getHandler(browser)
        , directives = splitDirectives(pick(settings, policyConfig.supportedDirectives))
        , headerData = handler(browser, directives, settings);

  let policyString;

  if (settings === false) {
    return res;
  }

  checkOptions(settings);

  if (settings.setAllHeaders) {
    headerData.headers = policyConfig.allHeaders;
  }

  if (headerData.headers.length) {
    policyString = getPolicyString(browser, headerData.directives || directives);
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

module.exports.flushCache = () => {
  Object.keys(policyStringCache).forEach((key) => {
    policyStringCache[key] = undefined;
  });
};
