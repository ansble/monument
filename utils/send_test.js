var assert = require('chai').assert
  , send = require('./send')
  , Events = require('events').EventEmitter;

describe('Send Tests', function () {
  'use strict';

  it('should be defined as a function', function () {
    assert.isFunction(send);
  });
});
