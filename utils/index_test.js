/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , utils = require('./index');

describe('Utils Tests', () => {

  it('should return an object that has a send and getCompression functions', () => {
    assert.isObject(utils);
    assert.isFunction(utils.send);
    assert.isFunction(utils.getCompression);
    assert.isFunction(utils.setup);
    assert.isFunction(utils.parsePath);
    assert.isFunction(utils.isDefined);
    assert.isFunction(utils.isUndefined);
    assert.isFunction(utils.not);
    assert.isFunction(utils.redirect);
    assert.isFunction(utils.contains);
  });

  describe('getCompression tests', () => {
    it('should return deflate if the deflate header is passed in', () => {
      assert.strictEqual(utils.getCompression('deflate', { compress: true }), 'deflate');
    });

    it('should return gzip if gzip is in the header passed in', () => {
      assert.strictEqual(utils.getCompression('gzip', { compress: true }), 'gzip');
    });

    it('should return br if brotli is in the header passed in', () => {
      assert.strictEqual(utils.getCompression('br', { compress: true }), 'br');
    });

    it('should return gzip if both gzip and deflate are in the header', () => {
      assert.strictEqual(utils.getCompression('deflate gzip', { compress: true }), 'gzip');
    });

    it('should return brotli if brotli, gzip and deflate are in the header', () => {
      assert.strictEqual(utils.getCompression('deflate gzip br', { compress: true }), 'br');
    });

    it('should return none if no header is passed in', () => {
      let header; // has no value... just exists

      assert.strictEqual(utils.getCompression(header, { compress: true }), 'none');
    });

    it('should return none if an empty header is passed in', () => {
      assert.strictEqual(utils.getCompression('', { compress: true }), 'none');
    });

    it('should return none if compression is turned off no matter what the header is', () => {
      assert.strictEqual(utils.getCompression('gzip', { compress: false }), 'none');
    });

    it('should return correct compression if compression is not in the config', () => {
      assert.strictEqual(utils.getCompression('gzip', {}), 'gzip');
    });
  });

  describe('send tests', () => {
    it('should have a send function', () => {
      assert.isFunction(utils.send);
    });
  });

  describe('setup tests', () => {
    it('utils should have a setup function', () => {
      assert.isFunction(utils.setup);
    });

    it('utils should log info about statsd', () => {
      let logMessage;
      const config = {
        log: {
          info: (msg) => {
            logMessage = msg;
          }
        }
        , statsd: {
          host: 'test'
          , port: '8080'
        }
      };

      utils.setup(config);
      assert.include(logMessage, config.statsd.host);
      assert.include(logMessage, config.statsd.port);
    });
  });
});
