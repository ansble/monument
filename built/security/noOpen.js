

module.exports = (config, res) => {
  if (config.security && config.security.noOpen === false) {
    return res;
  } else {
    res.setHeader('X-Download-Options', 'noopen');

    return res;
  }
};