
const cacheControlString = 'private, no-store, no-cache, must-revalidate, proxy-revalidate';

module.exports = (config, resIn) => {
  const res = resIn;

  res.noCache = function (etags) {
    this.setHeader('Surrogate-Control', 'no-store');
    this.setHeader('Cache-Control', cacheControlString);
    this.setHeader('Pragma', 'no-cache');
    this.setHeader('Expires', '0');

    if (etags) {
      this.removeHeader('ETag');
    }
  };

  if (config.security && config.security.noCache) {
    res.noCache(true);
  }

  return res;
};