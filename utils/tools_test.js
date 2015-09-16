'use strict';

const assert = require('chai').assert
    , tools = require('./tools');

describe('Tools Tests', () => {
  it('should return an object', () => {
    assert.isObject(tools);
    assert.isFunction(tools.isDefined);
    assert.isFunction(tools.not);
  });

  describe('.isDefined tests', () => {
    it('should return false it the item is undefined',() => {
      const some = {};

      assert.strictEqual(tools.isDefined(some.test), false);
    });

    it('should return true it the item is defined',() => {
      const some = {
        test: true
      };

      assert.strictEqual(tools.isDefined(some.test), true);
    });
  });

  describe('.not tests', () => {
    it('should return false if true is passed to it',() => {
      assert.strictEqual(tools.not(true), false);
    });
  });
});
