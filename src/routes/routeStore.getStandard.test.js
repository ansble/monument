/* eslint-env node, mocha */


const test = require('ava')
      , routeStore = require('./routeStore');

test.afterEach(() => {
  routeStore.clear();
});


test.beforeEach(() => {
  routeStore.add('/test', [ 'get', 'put' ]);
});

test('should return the current standard routes only', (t) => {
  const routes = routeStore.getStandard();

  t.is(typeof routes, 'object');
  t.true(Array.isArray(routes['/test']));
});
