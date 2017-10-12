/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , socketUtils = require('./utils');

describe('WebSocket utils', () => {
  it('should return a parse function', () => {
    assert.isObject(socketUtils);
    assert.isFunction(socketUtils.isDataEvent);
    assert.isFunction(socketUtils.getMessage);
    assert.isFunction(socketUtils.getSetEventString);
  });

  describe('.getSetEventString', () => {
    it('should replace :get: with :set: in the event name', () => {
      assert.strictEqual(socketUtils.getSetEventString({ event: 'my:get:event' }), 'my:set:event');
    });

    it('should return empty string if event is not a string', () => {
      assert.strictEqual(socketUtils.getSetEventString({}), '');
    });

    it('should return empty string if nothing passed in', () => {
      assert.strictEqual(socketUtils.getSetEventString(), '');
    });
  });

  describe('.getMessage', () => {
    it('should return parsed JSON', () => {
      assert.isObject(socketUtils.getMessage('{"test":true}'));
      assert.strictEqual(socketUtils.getMessage('{"test":true}').test, true);
    });

    it('should return an empty object if invalid json', () => {
      assert.isObject(socketUtils.getMessage('this is a sentence not JSON'));
      assert.strictEqual(Object.keys(socketUtils.getMessage('this is a sentence not JSON')).length, 0);
    });
  });

  describe('.isDataEvent', () => {
    it('returns false is event and setEvent are equal', () => {
      assert.isFalse(socketUtils.isDataEvent('test', 'test'));
    });

    it('returns true is event and setEvent are not equal', () => {
      assert.isTrue(socketUtils.isDataEvent('test', 'frog'));
    });
  });
});
