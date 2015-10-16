'use strict';

const poweredBy = require('./poweredByHeader')
    , xssHeader = require('./xssHeader')
    , noSniff = require('./noSniff');

module.exports = (config, reqIn, resIn) => {
    let res = resIn
        , req = reqIn;

    res = poweredBy(config, res);
    res = xssHeader(config, res, req);
    res = noSniff(config, res);

    return res;
};
