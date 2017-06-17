/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , noSniff = require('./noSniff')
      , res = {}
      , config = {};

describe('Security Headers: X-Content-Type-Options Tests', () => {
  beforeEach(() => {
    res.headers = {};

    res.setHeader = function (key, value) {
      this.headers[key] = value;
    };

    config.security = {};
  });

  it('should return a function', () => {
    assert.isFunction(noSniff);
  });

  it('should set a header if there is no option in config', () => {
    noSniff(config, res);

    assert.strictEqual(res.headers['X-Content-Type-Options'], 'nosniff');
  });

  it('should set a header if the config is true', () => {
    config.security.noSniff = true;
    noSniff(config, res);

    assert.strictEqual(res.headers['X-Content-Type-Options'], 'nosniff');
  });

  it('should not set a header if the config is false', () => {
    config.security.noSniff = false;
    noSniff(config, res);

    assert.isUndefined(res.headers['X-Content-Type-Options']);
  });

  it('should return res when executed', () => {
    assert.strictEqual(res, noSniff(config, res));
  });
});
