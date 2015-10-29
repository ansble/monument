'use strict';

const poweredBy = require('./poweredByHeader')
    , xssHeader = require('./xssHeader')
    , noSniff = require('./noSniff')
    , noOpen = require('./noOpen')
    , hsts = require('./hsts')
    , noCache = require('./noCache');

module.exports = (config, reqIn, resIn) => {
    let res = resIn
        , req = reqIn;

    res = poweredBy(config, res);
    res = xssHeader(config, res, req);
    res = noSniff(config, res);
    res = noOpen(config, res);
    res = hsts(config, res);
    res = noCache(config, res);

    return res;
};
