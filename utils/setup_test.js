'use strict';

const assert = require('chai').assert
  , setup = require('./setup');

describe('setup Tests', () => {

  it('should be an object of setup functions', () => {
    assert.isObject(setup);
    assert.isFunction(setup.compressed);
    assert.isFunction(setup.templates);
  });
});
