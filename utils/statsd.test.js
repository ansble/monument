'use strict';

const test = require('ava')
      , StatsD = require('node-statsd')
      , statsd = require('./statsd');

test('should return an object', (t) => {
  t.is(typeof statsd, 'object');
  t.is(typeof statsd.create, 'function');
});

test('statsd.create should return StatsD object', (t) => {
  t.true(statsd.create({}) instanceof StatsD);
});
