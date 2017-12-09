

const test = require('ava')
      , parseRoutes = require('./parseRoutes')
      , stubRoutes = require('../test_stubs/routes_stub.json');

test('should export a function', (t) => {
  t.is(typeof parseRoutes, 'function');
});

test('should return an object containing wildcard and standard routes', (t) => {
  const routes = parseRoutes(stubRoutes);

  t.is(typeof routes, 'object');
  t.is(typeof routes.wildcard, 'object');
  t.is(typeof routes.standard, 'object');
});

test('should return an object containing 2 wildcard routes', (t) => {
  const routes = parseRoutes(stubRoutes);

  t.is(typeof routes, 'object');
  t.is(typeof routes.wildcard['/:id'], 'object');
  t.is(typeof routes.wildcard['/api/articles/:id'], 'object');
});

test('should return a properly formatted route object for /:id', (t) => {
  const routes = parseRoutes(stubRoutes)
        , idRoute = routes.wildcard['/:id'];

  t.is(typeof routes, 'object');
  t.is(typeof idRoute, 'object');
  t.true(Array.isArray(idRoute.verbs));
  t.true(Array.isArray(idRoute.variables));
  t.is(idRoute.eventId, '/:id');
  t.true(new RegExp(idRoute.regex) instanceof RegExp);
});

test('should return an object containing 8 standard routes', (t) => {
  const routes = parseRoutes(stubRoutes);

  t.is(typeof routes, 'object');
  t.true(Array.isArray(routes.standard['/']));
  t.true(Array.isArray(routes.standard['/api/articles']));
  t.true(Array.isArray(routes.standard['/api']));
  t.true(Array.isArray(routes.standard['/api/search']));
  t.true(Array.isArray(routes.standard['/rss']));
  t.true(Array.isArray(routes.standard['/stuff']));
  t.true(Array.isArray(routes.standard['/search']));
  t.true(Array.isArray(routes.standard['/about']));
});
