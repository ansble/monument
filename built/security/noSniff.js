

const isDefined = require('../utils').isDefined,
      not = require('../utils').not,
      addHeader = config => {
  return not(isDefined(config.security) && isDefined(config.security.noSniff) && config.security.noSniff === false);
};

module.exports = (config, res) => {
  if (addHeader(config)) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }

  return res;
};