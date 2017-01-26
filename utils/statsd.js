'use strict';

const StatsD = require('node-statsd');


module.exports = {
    create: (options) => {
        return new StatsD(options);
    }
};



    var startTime = new Date().getTime();

    // Function called on response finish that sends stats to statsd
    function sendStats() {
      var key = req[options.requestKey];
      key = key ? key + '.' : '';

      // Status Code
      var statusCode = res.statusCode || 'unknown_status';
      client.increment(key + 'status_code.' + statusCode);

      // Response Time
      var duration = new Date().getTime() - startTime;
      client.timing(key + 'response_time', duration);

      cleanup();
    }

    // Function to clean up the listeners we've added
    function cleanup() {
      res.removeListener('finish', sendStats);
      res.removeListener('error', cleanup);
      res.removeListener('close', cleanup);
    }

    // Add response listeners
    res.once('finish', sendStats);
    res.once('error', cleanup);
    res.once('close', cleanup);
