'use strict';
/* eslint-disable  no-extra-parens */

const StatsD = require('node-statsd');

module.exports = {
  create: (options) => {
    return new StatsD(options);
  }
  , shouldSendTimer: (config, statusCode) => {
    return typeof statusCode === 'string' ? false :
      statusCode < 300 ||
      (config.statsd.send4xx && statusCode >= 400 && statusCode < 500) ||
      (config.statsd.send3xx && statusCode >= 300 && statusCode < 400) ||
      (config.statsd.send5xx && statusCode >= 500);
  }
};
