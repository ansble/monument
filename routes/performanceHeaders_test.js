/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , performanceHeaders = require('./performanceHeaders');

describe('The Performance Headers tests', () => {

  it('should be correctly defined', () => {
    assert.isFunction(performanceHeaders);
  });

  it('should return an object with start and end', () => {
    const timers = performanceHeaders({});

    assert.isFunction(timers.start);
    assert.isFunction(timers.end);
  });

  describe('.start', () => {
    let timers, perfTimers;

    beforeEach(() => {
      timers = {};
      perfTimers = performanceHeaders(timers);

    });

    it('should add a timer to the timers object', () => {
      perfTimers.start('test');

      assert.isDefined(timers.test);
      assert.isDefined(timers.test.start);
    });

    it('should return the timer created', () => {
      const testTimer = perfTimers.start('test');

      assert.isDefined(timers.test);
      assert.strictEqual(testTimer, timers.test.start);
    });
  });

  describe('.end', () => {
    let timers, perfTimers;

    beforeEach(() => {
      timers = {};
      perfTimers = performanceHeaders(timers);
      perfTimers.start('test');
    });

    it('should end the timer', () => {
      perfTimers.end('test');

      assert.isDefined(timers.test.end);
      assert.isDefined(timers.test.delta);
    });

    it('should return the delta between start and end', () => {
      assert.strictEqual(perfTimers.end('test'), timers.test.delta);
    });

    it('should return undefined if timer does not exist', () => {
      assert.isUndefined(perfTimers.end('c3p0'));
    });
  });
});
