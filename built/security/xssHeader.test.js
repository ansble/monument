

const test = require('ava'),
      xssHeader = require('./xssHeader'),
      userAgents = require('../test_stubs/userAgents.json'),
      chromeOSXUA = userAgents['Chrome 27'].string,
      IE11UA = userAgents['Internet Explorer 11 on Windows 8.1'].string,
      IE11UA2 = userAgents['Internet Explorer 11 on Windows 7'].string,
      IE8UA = userAgents['Internet Explorer 8'].string,
      res = {},
      req = {},
      config = {};

test.beforeEach(() => {
  req.headers = {};
  res.headers = {};

  res.setHeader = function (key, value) {
    this.headers[key] = value;
  };

  config.security = {};
});

test('should return a function', t => {
  t.is(typeof xssHeader, 'function');
});

test('should return res when executed', t => {
  t.is(res, xssHeader(config, res, req));
});

test('should set the correct header if old IE', t => {
  req.headers['user-agent'] = IE8UA;

  t.is(xssHeader(config, res, req).headers['X-XSS-Protection'], '0');
});

test('should set the correct header if IE', t => {
  req.headers['user-agent'] = chromeOSXUA;

  const result = xssHeader(config, res, req);

  t.is(result.headers['X-XSS-Protection'], '1; mode=block');
});

test('should set the correct header if new IE', t => {
  let result;

  req.headers['user-agent'] = IE11UA2;
  result = xssHeader(config, res, req);
  t.is(result.headers['X-XSS-Protection'], '1; mode=block');

  req.headers['user-agent'] = IE11UA;
  result = xssHeader(config, res, req);
  t.is(result.headers['X-XSS-Protection'], '1; mode=block');
});

test('should not set the header if config.security.xssProtection is false', t => {
  config.security.xssProtection = false;

  req.headers['user-agent'] = IE11UA;
  t.is(typeof xssHeader(config, res, req).headers['X-XSS-Protection'], 'undefined');
});