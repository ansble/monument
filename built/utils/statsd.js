

const StatsD = require('node-statsd');

module.exports = {
  create: options => {
    return new StatsD(options);
  }
};