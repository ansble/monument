

const test = require('ava')
      , noSniff = require('./noSniff')
      , res = {}
      , config = {};

test.beforeEach(() => {
  res.headers = {};

  res.setHeader = function (key, value) {
    this.headers[key] = value;
  };

  config.security = {};
});

test('should return a function', (t) => {
  t.is(typeof noSniff, 'function');
});

test('should set a header if there is no option in config', (t) => {
  noSniff(config, res);

  t.is(res.headers['X-Content-Type-Options'], 'nosniff');
});

test('should set a header if the config is true', (t) => {
  config.security.noSniff = true;
  noSniff(config, res);

  t.is(res.headers['X-Content-Type-Options'], 'nosniff');
});

test('should not set a header if the config is false', (t) => {
  config.security.noSniff = false;
  noSniff(config, res);

  t.is(typeof res.headers['X-Content-Type-Options'], 'undefined');
});

test('should return res when executed', (t) => {
  t.is(res, noSniff(config, res));
});
