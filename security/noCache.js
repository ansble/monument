'use strict';

module.exports = (config, res) => {
    if (config.security && config.security.noCache) {
        res.setHeader('Surrogate-Control', 'no-store');
        res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        if (config.security.noCache.noEtag) {
          res.removeHeader('ETag');
        }
    }

    return res;
};
