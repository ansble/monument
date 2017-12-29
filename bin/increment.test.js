'use strict';

const increment = require('./increment')
      , test = require('ava');

test('should be a function', (t) => {
  t.is(typeof increment, 'function');
});

test('should increment only patch when incrementing patch', (t) => {
  t.is(increment('1.2.3', 'patch'), '1.2.4');
});

test('should increment only patch when incrementing patch', (t) => {
  t.is(increment('1.2.3', 'minor'), '1.3.0');
});

test('should increment only patch when incrementing patch', (t) => {
  t.is(increment('1.2.3', 'major'), '2.0.0');
});
