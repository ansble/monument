'use strict';

const oneDay = 86400
      , isDefined = require('../utils').isDefined
      , hasOptions = (config) => {
        return isDefined(config.security) && isDefined(config.security.hsts);
      }

      , inValidMaxAge = (maxAge) => {
        return typeof maxAge !== 'number' || maxAge < 0;
      }

      , addSubdomainFlag = (headerIn, includeSubdomains) => {
        let header = headerIn;

        if (includeSubdomains !== false) {
          header += '; includeSubdomains';
        }

        return header;
      }

      , addPreloadFlag = (headerIn, preload) => {
        let header = headerIn;

        if (preload !== false) {
          header += '; preload';
        }

        return header;
      };

module.exports = (config, res) => {
  const hstsOptions = hasOptions(config) ? config.security.hsts : {}
        , maxAge = isDefined(hstsOptions.maxAge) ? hstsOptions.maxAge : oneDay

        , maxAgeError = () => {
          throw new Error('maxAge must be a positive number of seconds for the HSTS header');
        };

  let header = '';

  if (hstsOptions) {
    if (inValidMaxAge(maxAge)) {
      maxAgeError();
    }

    header = `max-age=${maxAge}`;
    header = addSubdomainFlag(header, hstsOptions.includeSubDomains);
    header = addPreloadFlag(header, hstsOptions.preload);

    res.setHeader('Strict-Transport-Security', header);
  }

  return res;
};
