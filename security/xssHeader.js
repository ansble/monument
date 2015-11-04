'use strict';
const IE9 = 9;

module.exports = (config, res, req) => {
    const matches = /msie\s*(\d+)/i.exec(req.headers['user-agent']);

    let value = '';

    if (config.security && config.security.xssProtection === false) {
        // the default is for this to be on unless you specify
        //  that it shouldn't be.
        return res;

    } else {
        // Setting the header to 1; mode=block opens security
        //  vulnerabilities in IE < 9 so the header gets disabled
        //  there. For everything else it is set.
        //
        // This defaults to being on
        if (!matches || parseFloat(matches[1]) >= IE9) {
            value = '1; mode=block';
        } else {
            value = '0';
        }

        res.setHeader('X-XSS-Protection', value);

        return res;
    }
};
