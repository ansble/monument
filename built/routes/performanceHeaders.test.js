

const test = require('ava'),
      performanceHeaders = require('./performanceHeaders');

test('should be correctly defined', t => {
  t.is(typeof performanceHeaders, 'function');
});

test('should return an object with start and end', t => {
  const timers = performanceHeaders({});

  t.is(typeof timers.start, 'function');
  t.is(typeof timers.end, 'function');
});

test('.start should add a timer to the timers object', t => {
  const timers = {},
        perfTimers = performanceHeaders(timers);

  perfTimers.start('test');

  t.not(typeof timers.test, 'undefined');
  t.not(typeof timers.test.start, 'undefined');
});

test('.start should return the timer created', t => {
  const timers = {},
        perfTimers = performanceHeaders(timers),
        testTimer = perfTimers.start('test');

  t.not(typeof timers.test, 'undefined');
  t.is(testTimer, timers.test.start);
});

test('.end should end the timer', t => {
  const timers = {},
        perfTimers = performanceHeaders(timers);

  perfTimers.start('test');

  perfTimers.end('test');

  t.not(typeof timers.test.end, 'undefined');
  t.not(typeof timers.test.delta, 'undefined');
});

test('.end should return the delta between start and end', t => {
  const timers = {},
        perfTimers = performanceHeaders(timers);

  perfTimers.start('test');

  t.is(perfTimers.end('test'), timers.test.delta);
});

test('.end should return undefined if timer does not exist', t => {
  const timers = {},
        perfTimers = performanceHeaders(timers);

  perfTimers.start('test');

  t.is(typeof perfTimers.end('c3p0'), 'undefined');
});

test('.end should return undefined if timer does not have start', t => {
  const timers = {},
        perfTimers = performanceHeaders(timers);

  perfTimers.start('run');

  timers.run = {};

  t.is(typeof perfTimers.end('run'), 'undefined');
});