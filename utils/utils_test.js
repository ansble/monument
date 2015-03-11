var assert = require('chai').assert
  , utils = require('./utils')
  , Events = require('events').EventEmitter;

describe('Utils Tests', function () {
  'use strict';

  it('should return an object that has a send and getCompression functions', function () {
    assert.isObject(utils)
    assert.isFunction(utils.send);
    assert.isFunction(utils.getCompression);
  });

  describe('getCompression tests', function () {
    it('should return deflate if the deflate header is passed in', function(){
      assert.strictEqual(utils.getCompression('deflate', {compress: true}), 'deflate');
    });
    it('should return gzip if gzip is in the header passed in', function () {
      assert.strictEqual(utils.getCompression('gzip', {compress: true}), 'gzip');
    });
    it('should return gzip if both gzip and deflate are in the header', function () {
      assert.strictEqual(utils.getCompression('deflate gzip', {compress: true}), 'gzip');
    });
    it('should return none if no header is passed in', function () {
      var header; //has no value... just exists

      assert.strictEqual(utils.getCompression(header, {compress: true}), 'none');
    });
    it('should return none if an empty header is passed in', function () {
      assert.strictEqual(utils.getCompression('', {compress: true}), 'none');
    });
  });

  describe('send tests', function () {
    it('should do things...');
  });
});
