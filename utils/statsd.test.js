'use strict';

const test = require('ava')
      , StatsD = require('node-statsd')
      , statsd = require('./statsd');

test('should return an object', (t) => {
  t.is(typeof statsd, 'object');
  t.is(typeof statsd.create, 'function');
  t.is(typeof statsd.shouldSendTimer, 'function');
});

test('statsd.create should return StatsD object', (t) => {
  t.true(statsd.create({}) instanceof StatsD);
});

test('statsd.shouldSendTimer returns false if statusCode is a string', (t) => {
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: false } }, 'a string'));
});

test('statsd.shouldSendTimer returns false if statusCode is a 400 and send4xx is false', (t) => {
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: false } }, 400));
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: true, send3xx: false } }, 400));
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: true } }, 400));
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: true, send3xx: true } }, 400));
});

test('statsd.shouldSendTimer returns false if statusCode is a 500 and send5xx is false', (t) => {
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: false } }, 500));
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: false, send3xx: false } }, 500));
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: true } }, 500));
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: false, send3xx: true } }, 500));
});

test('statsd.shouldSendTimer returns false if statusCode is a 300 and send3xx is false', (t) => {
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: false } }, 300));
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: false, send3xx: false } }, 300));
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: true, send3xx: false } }, 300));
  t.false(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: true, send3xx: false } }, 300));
});

test('statsd.shouldSendTimer returns true if statusCode is a 200', (t) => {
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: false } }, 200));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: false, send3xx: false } }, 200));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: true } }, 200));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: false, send3xx: true } }, 200));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: true, send3xx: true } }, 200));
});

test('statsd.shouldSendTimer returns true if statusCode is a 100', (t) => {
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: false } }, 100));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: false, send3xx: false } }, 100));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: true } }, 100));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: false, send3xx: true } }, 100));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: true, send3xx: true } }, 100));
});

test('statsd.shouldSendTimer returns true if statusCode is a 300 and send3xx is true', (t) => {
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: false, send3xx: true } }, 300));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: false, send3xx: true } }, 300));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: true, send3xx: true } }, 300));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: true, send3xx: true } }, 300));
});

test('statsd.shouldSendTimer returns true if statusCode is a 400 and send4xx is true', (t) => {
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: false, send3xx: true } }, 400));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: false, send3xx: false } }, 400));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: true, send3xx: false } }, 400));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: true, send3xx: true } }, 400));
});

test('statsd.shouldSendTimer returns true if statusCode is a 500 and send5xx is true', (t) => {
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: true, send3xx: true } }, 500));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: true, send3xx: false } }, 500));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: true, send5xx: true, send3xx: false } }, 500));
  t.true(statsd.shouldSendTimer({ statsd: { send4xx: false, send5xx: true, send3xx: true } }, 500));
});

