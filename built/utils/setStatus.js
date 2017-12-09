

const statusCodes = require('http').STATUS_CODES,
      isUndefined = require('./tools').isUndefined,
      statusMatches = status => {
  return Object.keys(statusCodes).find(k => {
    if (statusCodes[k].toLowerCase() === status.toLowerCase()) {
      return true;
    }
    return false;
  });
},
      setStatus = function (status) {
  const that = this;


  if (typeof status === 'number' && !isUndefined(statusCodes[status])) {
    that.statusCode = parseInt(status, 10);
    that.statusMessage = statusCodes[status];
  }

  if (typeof status === 'string' && statusMatches(status)) {
    that.statusCode = parseInt(statusMatches(status), 10);
    that.statusMessage = statusCodes[statusMatches(status)];
  }

  return that;
};

module.exports = setStatus;