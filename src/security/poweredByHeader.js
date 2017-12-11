

const isDefined = require('../utils').isDefined;

module.exports = (config, res) => {
  if (isDefined(config.security) && isDefined(config.security.poweredBy)) {
    res.setHeader('X-Powered-By', config.security.poweredBy);
  }

  return res;
};
