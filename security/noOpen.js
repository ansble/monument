'use strict';

module.exports = (config, res) => {
  if (config.security && config.security.noOpen === false) {
    // the default is for this to be on unless you specify
    //  that it shouldn't be.
    return res;

  } else {
    // this closes a vulnerability in IE 8 related to file downloads
    //  has no effect on other browsers
    res.setHeader('X-Download-Options', 'noopen');

    return res;
  }
};
