var assert = require('chai').assert
  , parser = require('./parser')
  , Events = require('events').EventEmitter;

describe('Parser Tests', function () {
  'use strict';

  it('should return a function', function () {
    assert.isFunction(parser);
  });

  it('should parse out a form submission');
  it('should parse out a json post/put/update');
  it('should place the parsed elements in req.body');
});
