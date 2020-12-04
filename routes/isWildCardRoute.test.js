'use strict';

const test = require('ava')
      , isWildCardRoute = require('./isWildCardRoute')
      , parseRoutes = require('./parseRoutes')
      , stubRoutes = parseRoutes(require('../test_stubs/routes_stub.json'));

test('should return a function', (t) => {
  t.is(typeof isWildCardRoute, 'function');
});

test('should return true if a wildcard route is passed in', (t) => {
  t.true(isWildCardRoute('/john-wayne', 'get', stubRoutes.wildcard));
  t.true(isWildCardRoute('/api/articles/1234', 'get', stubRoutes.wildcard));
});

test('should return false if the route does match a pattern but variables are invalid', (t) => {
  t.false(isWildCardRoute('/api/articles/1234/links/stuff/32', 'get', stubRoutes.wildcard));
});

test('should return false if a wildcard route is passed in but the verb mismatches', (t) => {
  t.false(isWildCardRoute('/john-wayne', 'post', stubRoutes.wildcard));
});

test('should return false if the route doesn\'t match any patterns', (t) => {
  t.false(isWildCardRoute('/api/search', 'get', stubRoutes.wildcard));
});
