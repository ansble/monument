var assert = require('chai').assert
  , setup = require('./setup');

describe('setup Tests', function () {
  'use strict';

  it('should be an object of setup functions', function () {
    assert.isObject(setup);
    assert.isFunction(setup.compressed);
    assert.isFunction(setup.templates);
  });
});
