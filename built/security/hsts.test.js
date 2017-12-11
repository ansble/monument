

const test = require('ava'),
      hsts = require('./hsts'),
      res = {},
      config = {};

test.beforeEach(() => {
  res.headers = {};
  res.setHeader = function (key, value) {
    this.headers[key] = value;
  };

  config.security = {};
});

test('should return a function', t => {
  t.is(typeof hsts, 'function');
});

test('should set a header if there is no option in config', t => {
  hsts(config, res);

  const result = res.headers['Strict-Transport-Security'];

  t.is(result, 'max-age=86400; includeSubdomains; preload');
});

test('should set a header if the config is true', t => {
  config.security.hsts = true;
  hsts(config, res);

  const result = res.headers['Strict-Transport-Security'];

  t.is(result, 'max-age=86400; includeSubdomains; preload');
});

test('should set a header with a different max age if passed in', t => {
  config.security.hsts = {
    maxAge: 100
  };
  hsts(config, res);

  const result = res.headers['Strict-Transport-Security'];

  t.is(result, 'max-age=100; includeSubdomains; preload');
});

test('should set a header with a different max age and no includeSubdomains if passed in', t => {
  config.security.hsts = {
    maxAge: 100,
    includeSubDomains: false
  };
  hsts(config, res);

  const result = res.headers['Strict-Transport-Security'];

  t.is(result, 'max-age=100; preload');
});

test('should set a header with no includeSubdomains if passed in', t => {
  config.security.hsts = {
    includeSubDomains: false
  };
  hsts(config, res);

  const result = res.headers['Strict-Transport-Security'];

  t.is(result, 'max-age=86400; preload');
});

test('should set a header with no preload if passed in', t => {
  config.security.hsts = {
    preload: false
  };
  hsts(config, res);

  const result = res.headers['Strict-Transport-Security'];

  t.is(result, 'max-age=86400; includeSubdomains');
});

test('should set a header with a different max age and no preloads if passed in', t => {
  config.security.hsts = {
    maxAge: 100,
    preload: false
  };
  hsts(config, res);

  const result = res.headers['Strict-Transport-Security'];

  t.is(result, 'max-age=100; includeSubdomains');
});

test('should set a header with a different max age and other options off if passed in', t => {
  config.security.hsts = {
    maxAge: 100,
    includeSubDomains: false,
    preload: false
  };
  hsts(config, res);

  const result = res.headers['Strict-Transport-Security'];

  t.is(result, 'max-age=100');
});

test('should set a header with a default max age and other options off if passed in', t => {
  config.security.hsts = {
    includeSubDomains: false,
    preload: false
  };
  hsts(config, res);

  const result = res.headers['Strict-Transport-Security'];

  t.is(result, 'max-age=86400');
});

test('should not set a header if the config is false', t => {
  config.security.hsts = false;
  hsts(config, res);

  const result = res.headers['Strict-Transport-Security'];

  t.is(typeof result, 'undefined');
});

test('should throw an error if a bad value for maxAge is passed in', t => {
  config.security.hsts = {
    maxAge: -1000
  };

  t.throws(() => {
    hsts(config, res);
  });

  config.security.hsts = {
    maxAge: 'Sam I am'
  };

  t.throws(() => {
    hsts(config, res);
  });
});

test('should return res when executed', t => {
  t.is(res, hsts(config, res));
});