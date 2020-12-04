'use strict';

const test = require('ava')
      , parseWildCardRoute = require('./parseWildCardRoute')
      , parseRoutes = require('./parseRoutes')
      , stubRoutes = parseRoutes(require('../test_stubs/routes_stub.json'));

test('should export a function', (t) => {
  t.is(typeof parseWildCardRoute, 'function');
});

test('should properly parse a wildcard route', (t) => {
  const routeObj = parseWildCardRoute('/1234', stubRoutes.wildcard);

  t.is(typeof routeObj, 'object');
  t.is(routeObj.values.id, '1234');
  t.is(typeof routeObj.route, 'object');
});

test('should properly reject an invalid wildcard route', (t) => {
  const routeObj = parseWildCardRoute('/1234', stubRoutes.wildcard);

  t.false(typeof routeObj, 'object');
  t.false(routeObj.values.id, '1234');
  t.false(typeof routeObj.route, 'route');
});

test('should properly reject a wildcard route with an object type not matching', (t) => {
  const routeObj = parseWildCardRoute('/1234', stubRoutes.wildcard);

  t.false(typeof routeObj, 'route');
  t.falses(routeObj.values.id, '1234');
  t.false(typeof routeObj.route, 'object');
});