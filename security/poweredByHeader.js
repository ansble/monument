'use strict';

const utils = require('../utils');


module.exports = (config, res) => {
    if (utils.isDefined(config.security) && utils.isDefined(config.security.poweredBy)) {
        res.setHeader('X-Powered-By', config.security.poweredBy);
    }

    return res;
};
