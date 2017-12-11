

const test = require('ava'),
      matchSimpleRoute = require('./matchSimpleRoute'),
      parseRoutes = require('./parseRoutes'),
      stubRoutes = parseRoutes(require('../test_stubs/routes_stub.json'));

test('should return a function', t => {
  t.is(typeof matchSimpleRoute, 'function');
});

test('should return null for a simple route', t => {
  t.not(matchSimpleRoute('/api/search', 'get', stubRoutes.standard), null);
});

test('should return null for a non-simple route', t => {
  t.is(matchSimpleRoute('/api/article/1234', 'get', stubRoutes.standard), null);
});

test('should return null for a simple route and wrong verb', t => {
  t.is(matchSimpleRoute('/api/search', 'post', stubRoutes.standard), null);
});

test('should return true for /about', t => {
  t.truthy(matchSimpleRoute('/about', 'get', stubRoutes.standard));
});

test('should return true for /', t => {
  t.truthy(matchSimpleRoute('/', 'get', stubRoutes.standard));
});

test('should not match for /:id', t => {
  t.falsy(matchSimpleRoute('/1234', 'get', stubRoutes.standard));
});

test('should return true for /about/ handling trailing slash', t => {
  t.truthy(matchSimpleRoute('/about/', 'get', stubRoutes.standard));
});