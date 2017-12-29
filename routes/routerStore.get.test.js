'use strict';

const test = require('ava')
      , routeStore = require('./routeStore');

test.afterEach(() => {
  routeStore.clear();
});

test('should return the current route object', (t) => {
  routeStore.parse(require('../test_stubs/routes_stub.json'));

  t.is(typeof routeStore.get(), 'object');
  t.is(typeof routeStore.get().standard, 'object');
  t.is(typeof routeStore.get().wildcard, 'object');
  t.true(Array.isArray(routeStore.get().standard['/']));
  t.true(Array.isArray(routeStore.get().standard['/api/articles']));
  t.true(Array.isArray(routeStore.get().standard['/api']));
});
