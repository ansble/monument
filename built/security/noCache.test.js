

const test = require('ava'),
      noCache = require('./noCache'),
      res = {},
      config = {};

test.beforeEach(() => {
  res.headers = {};
  res.setHeader = function (key, value) {
    this.headers[key] = value;
  };

  res.removeHeader = function (key) {
    this.headers[key] = undefined;
  };

  config.security = {};
});

test('should return a function', t => {
  t.is(typeof noCache, 'function');
});

test('should not set a header if there is no option in config', t => {
  noCache(config, res);

  t.is(typeof res.headers['Cache-Control'], 'undefined');
});

test('should set all the headers if the config is true', t => {
  config.security.noCache = true;
  noCache(config, res);

  t.not(typeof res.headers['Cache-Control'], 'undefined');
  t.not(typeof res.headers['Surrogate-Control'], 'undefined');
  t.not(typeof res.headers.Pragma, 'undefined');
  t.not(typeof res.headers.Expires, 'undefined');
});

test('should kill the etag and set all headers if the config.etag is true', t => {
  config.security.noCache = { noEtag: true };
  res.headers.ETag = 'someEtagString';

  noCache(config, res);

  t.not(typeof res.headers['Cache-Control'], 'undefined');
  t.not(typeof res.headers['Surrogate-Control'], 'undefined');
  t.not(typeof res.headers.Pragma, 'undefined');
  t.not(typeof res.headers.Expires, 'undefined');
  t.is(typeof res.headers.etag, 'undefined');
});

test('should return res when executed', t => {
  t.is(res, noCache(config, res));
});

test('should add a noCache function to res when executed', t => {
  noCache(config, res);
  t.not(typeof res.noCache, 'undefined');
  t.is(typeof res.noCache, 'function');
});