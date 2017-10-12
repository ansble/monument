/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , StatsD = require('node-statsd')
      , statsd = require('./statsd');

describe('statsd Tests', () => {
  it('should return an object', () => {
    assert.isObject(statsd);
    assert.isFunction(statsd.create);
  });

  it('statsd.create should return StatsD object', () => {
    assert.isTrue(statsd.create({}) instanceof StatsD);
  });
});
