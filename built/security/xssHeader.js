
const IE9 = 9,
      platform = require('platform'),
      isOldIE = browser => {
  return browser.name === 'IE' && parseFloat(browser.version) < IE9;
},
      getUserAgent = req => {
  return req.headers['user-agent'];
};

module.exports = (config, res, req) => {
  const header = getUserAgent(req),
        browser = platform.parse(header);

  let value = '';

  if (config.security && config.security.xssProtection === false) {
    return res;
  } else {
    if (isOldIE(browser)) {
      value = '0';
    } else {
      value = '1; mode=block';
    }

    res.setHeader('X-XSS-Protection', value);

    return res;
  }
};