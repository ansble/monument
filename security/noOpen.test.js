'use strict';

const test =  require('ava')
      , noOpen = require('./noOpen')
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
  t.is(typeof noOpen, 'function');
});

test('should set a header if there is no option in config', (t) => {
  noOpen(config, res);

  t.is(res.headers['X-Download-Options'], 'noopen');
});

test('should set a header if the config is true', (t) => {
  config.security.noOpen = true;
  noOpen(config, res);

  t.is(res.headers['X-Download-Options'], 'noopen');
});

test('should not set a header if the config is false', (t) => {
  config.security.noOpen = false;
  noOpen(config, res);

  t.is(typeof res.headers['X-Download-Options'], 'undefined');
});

test('should return res when executed', (t) => {
  t.is(res, noOpen(config, res));
});
