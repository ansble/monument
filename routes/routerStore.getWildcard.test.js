/* eslint-env node, mocha */
'use strict';

const test = require('ava')
      , routeStore = require('./routeStore');

test.afterEach(() => {
  routeStore.clear();
});

test.beforeEach(() => {
  routeStore.add('/test/:id', [ 'get', 'put' ]);
});

test('should return the current wildcard routes only', (t) => {
  const routes = routeStore.getWildcard();

  t.is(typeof routes, 'object');
  t.is(typeof routes['/test/:id'], 'object');
});
