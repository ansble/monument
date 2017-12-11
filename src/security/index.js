

const poweredBy = require('./poweredByHeader')
      , xssHeader = require('./xssHeader')
      , noSniff = require('./noSniff')
      , noOpen = require('./noOpen')
      , hsts = require('./hsts')
      , noCache = require('./noCache')
      , publicKeyPin = require('./publicKeyPinning')
      , contentSecurity = require('./contentSecurityPolicy');

module.exports = (config, reqIn, resIn) => {
  let res = resIn;

  res = poweredBy(config, res);
  res = xssHeader(config, res, reqIn);
  res = noSniff(config, res);
  res = noOpen(config, res);
  res = hsts(config, res);
  res = noCache(config, res);
  res = publicKeyPin(config, res);
  res = contentSecurity(config, reqIn, res);

  return res;
};
