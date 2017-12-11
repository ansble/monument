

const test = require('ava'),
      frameguard = require('./frameguard'),
      config = {},
      createConfig = (action, options) => {
  return {
    security: {
      frameguard: {
        action: action,
        domain: options
      }
    }
  };
},
      wrapForThrow = configIn => {
  return () => {
    frameguard(configIn);
  };
},
      refError = 'X-Frame must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN"',
      optionError = 'X-Frame: ALLOW-FROM requires an option in' + ' config.security.frameguard parameter',
      badNumericalInput = 123,
      badArrayOfURLs = ['http://website.com', 'http//otherwebsite.com'],
      badArrayFirst = ['ALLOW-FROM', 'http://example.com'];

let res = {};

test.beforeEach(() => {
  res = {};
  res.headers = {};
  res.setHeader = function (key, value) {
    this.headers[key] = value;
  };

  config.security = {};
});

test('returns a function', t => {
  t.is(typeof frameguard, 'function');
});

test('with proper input sets header to SAMEORIGIN with no arguments', t => {
  t.is(frameguard(config, res).headers['X-Frame-Options'], 'SAMEORIGIN');
});

test('with proper input sets header to DENY when called with lowercase "deny"', t => {
  config.security.frameguard = {};
  config.security.frameguard.action = 'deny';
  t.is(frameguard(config, res).headers['X-Frame-Options'], 'DENY');
});

test('with proper input sets header to DENY when called with uppercase "DENY"', t => {
  config.security.frameguard = {};
  config.security.frameguard.action = 'DENY';
  t.is(frameguard(config, res).headers['X-Frame-Options'], 'DENY');
});

test('with proper input sets header to SAMEORIGIN when called with lowercase "sameorigin"', t => {
  config.security.frameguard = {};
  config.security.frameguard.action = 'sameorigin';
  t.is(frameguard(config, res).headers['X-Frame-Options'], 'SAMEORIGIN');
});

test('with proper input sets header to SAMEORIGIN when called with uppercase "SAMEORIGIN"', t => {
  config.security.frameguard = {};
  config.security.frameguard.action = 'SAMEORIGIN';
  t.is(frameguard(config, res).headers['X-Frame-Options'], 'SAMEORIGIN');
});

test('with proper input sets header properly when called with lowercase "allow-from"', t => {
  config.security.frameguard = {};
  config.security.frameguard.action = 'allow-from';
  config.security.frameguard.domain = 'designfrontier.net';

  const result = frameguard(config, res);

  t.is(result.headers['X-Frame-Options'], 'ALLOW-FROM designfrontier.net');
});

test('with proper input sets header properly when called with uppercase "ALLOW-FROM"', t => {
  config.security.frameguard = {};
  config.security.frameguard.action = 'ALLOW-FROM';
  config.security.frameguard.domain = 'designfrontier.net';

  const result = frameguard(config, res);

  t.is(result.headers['X-Frame-Options'], 'ALLOW-FROM designfrontier.net');
});

test('with i  mproper input fails with a bad first argument', t => {
  t.throws(wrapForThrow(createConfig(' ')), refError);
  t.throws(wrapForThrow(createConfig('denyy')), refError);
  t.throws(wrapForThrow(createConfig('DENNY')), refError);
  t.throws(wrapForThrow(createConfig(' deny ')), refError);
  t.throws(wrapForThrow(createConfig(' DENY ')), refError);
  t.throws(wrapForThrow(createConfig(badNumericalInput)), refError);
  t.throws(wrapForThrow(createConfig(false)), refError);
  t.throws(wrapForThrow(createConfig(null)), refError);
  t.throws(wrapForThrow(createConfig({})), refError);
  t.throws(wrapForThrow(createConfig([])), refError);
  t.throws(wrapForThrow(createConfig(badArrayFirst)), refError);
  t.throws(wrapForThrow(createConfig(/cool_regex/g)), refError);
});

test('with improper input fails with a bad second argument if the first is "ALLOW-FROM"', t => {
  t.throws(wrapForThrow(createConfig('ALLOW-FROM')), optionError);
  t.throws(wrapForThrow(createConfig('ALLOW-FROM', null)), optionError);
  t.throws(wrapForThrow(createConfig('ALLOW-FROM', false)), optionError);
  t.throws(wrapForThrow(createConfig('ALLOW-FROM', badNumericalInput)), optionError);
  t.throws(wrapForThrow(createConfig('ALLOW-FROM', badArrayOfURLs)), optionError);
});