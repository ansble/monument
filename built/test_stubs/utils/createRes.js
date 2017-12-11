

const events = require('harken'),
      stream = require('stream');

module.exports = () => {
  const res = new stream.Writable();

  res.setHeader = function (name, value) {
    this.headers[name] = value;
  };

  res.writeHead = function (status, headers = {}) {
    this.statusCode = status;
    this.headers = Object.keys(headers).reduce((prevIn, key) => {
      const prev = prevIn;

      prev[key] = headers[key];

      return prev;
    }, this.headers);
  };

  res.statusCode = 0;
  res.headers = {};

  res._write = function (chunk, enc, cb) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);

    events.emit('response', buffer.toString());
    cb();
  };

  return res;
};