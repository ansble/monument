'use strict';

const killCache = function (etags) {
    this.setHeader('Surrogate-Control', 'no-store');
    this.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate');
    this.setHeader('Pragma', 'no-cache');
    this.setHeader('Expires', '0');

    if (etags) {
      this.removeHeader('ETag');
    }
};

module.exports = (config, res) => {
    res.noCache = killCache;

    if (config.security && config.security.noCache) {
        res.noCache(config.security.noCache.noEtag);
    }

    return res;
};
