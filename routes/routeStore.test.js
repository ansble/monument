'use strict';

const test = require('ava')
      , routeStore = require('./routeStore');

test.afterEach(() => {
  routeStore.clear();
});

test('should return an object', (t) => {
  t.is(typeof routeStore.get, 'function');
  t.is(typeof routeStore.getStandard, 'function');
  t.is(typeof routeStore.getWildcard, 'function');
  t.is(typeof routeStore.add, 'function');
  t.is(typeof routeStore.remove, 'function');
  t.is(typeof routeStore.parse, 'function');
});

test('should add a route to the server', (t) => {
  const wild = routeStore.add('/this/is/a/:test', [ 'get', 'post' ]);

  t.true(Array.isArray(routeStore.add('/this/is/a/test', 'get').standard['/this/is/a/test']));
  t.is(typeof wild.wildcard['/this/is/a/:test'], 'object');
});

test('should add a verb if the route already exists', (t) => {
  const step1 = routeStore.add('/this/is/a/test', 'get');

  t.is(step1.standard['/this/is/a/test'].length, 1);
  t.is(step1.standard['/this/is/a/test'][0], 'get');

  t.is(routeStore.add('/this/is/a/test', 'post')
    .standard['/this/is/a/test'].length, 2);

  t.is(routeStore.add('/this/is/a/test', 'post')
    .standard['/this/is/a/test'][0], 'get');

  t.is(routeStore.add('/this/is/a/test', 'post')
    .standard['/this/is/a/test'][1], 'post');


  t.is(routeStore.add('/this/is/a/test', [ 'put', 'report' ])
    .standard['/this/is/a/test'].length, 4);

  t.is(routeStore.add('/this/is/a/test', [ 'put', 'report' ])
    .standard['/this/is/a/test'][0], 'get');

  t.is(routeStore.add('/this/is/a/test', [ 'put', 'report' ])
    .standard['/this/is/a/test'][1], 'post');

  t.is(routeStore.add('/this/is/a/test', [ 'put', 'report' ])
    .standard['/this/is/a/test'][2], 'put');

  t.is(routeStore.add('/this/is/a/test', [ 'put', 'report' ])
    .standard['/this/is/a/test'][3], 'report');

});

test('should do nothing if there is no change', (t) => {
  const step1 = routeStore.add('/this/is/a/test', 'get');

  t.is(step1.standard['/this/is/a/test'].length, 1);
  t.is(step1.standard['/this/is/a/test'][0], 'get');

  t.is(routeStore.add('/this/is/a/test', 'get')
    .standard['/this/is/a/test']
    .length, 1);
});
