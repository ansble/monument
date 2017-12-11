

const test = require('ava')
      , poweredByHeader = require('./poweredByHeader')
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
  t.is(typeof poweredByHeader, 'function');
});

test('should not set a header if there is no option to in config', (t) => {
  poweredByHeader(config, res);

  t.is(typeof res.headers['X-Powered-By'], 'undefined');
});

test('should set a header if a value for one is in config', (t) => {
  config.security.poweredBy = 'bacon';
  poweredByHeader(config, res);

  t.is(res.headers['X-Powered-By'], 'bacon');
});

test('should return res when executed', (t) => {
  t.is(res, poweredByHeader(config, res));
});
