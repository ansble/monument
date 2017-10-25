/* eslint-env node, mocha */
'use strict';

const test = require('ava')
      , routeStore = require('./routeStore');

test.afterEach(() => {
  routeStore.clear();
});

test('should parse a routes.json', (t) => {
  const routes = routeStore.parse(require('../test_stubs/routes_stub.json'));

  t.is(typeof routes, 'object');
  t.true(Array.isArray(routes.standard['/']));
  t.true(Array.isArray(routes.standard['/api/articles']));
  t.true(Array.isArray(routes.standard['/api']));
});
