'use strict';

const poweredBy = require('./poweredByHeader')
    , xssHeader = require('./xssHeader');

module.exports = (config, reqIn, resIn) => {
    let res = resIn
        , req = reqIn;

    res = poweredBy(config, res);
    // res = xssHeader(config, res, req);

    return res;
};
