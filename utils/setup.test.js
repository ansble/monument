'use strict';

const test = require('ava')
      , setup = require('./setup')
      , events = require('harken');

test('should be an object of setup functions', (t) => {
  t.is(typeof setup, 'object');
  t.is(typeof setup.compressed, 'function');
  t.is(typeof setup.etags, 'function');
});

test.cb('should setup listeners for etags', (t) => {
  events.once('setup:etags', () => {
    t.is(true, true);
    t.end();
  });

  setup.etags();
});
