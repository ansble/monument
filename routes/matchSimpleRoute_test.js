'use strict';

const assert = require('chai').assert
    , matchSimpleRoute = require('./matchSimpleRoute')
    , parseRoutes = require('./parseRoutes')
    , stubRoutes = parseRoutes(require('../test_stubs/routes_stub.json'));

describe('matchSimpleRoute Tests', () => {
  it('should return a function', () => {
    assert.isFunction(matchSimpleRoute);
  });

  it('should return null for a simple route', () => {
    assert.isNotNull(matchSimpleRoute('/api/search', 'get', stubRoutes.standard));
  });

  it('should return null for a non-simple route', () => {
    assert.isNull(matchSimpleRoute('/api/article/1234', 'get', stubRoutes.standard));
  });

  it('should return null for a simple route and wrong verb', () => {
    assert.isNull(matchSimpleRoute('/api/search', 'post', stubRoutes.standard));
  });

  it('should return true for /about', function () {
    assert.ok(matchSimpleRoute('/about', 'get', stubRoutes.standard));
});

it('should return true for /', function () {
    assert.ok(matchSimpleRoute('/', 'get', stubRoutes.standard));
});

it('should not match for /:id', function () {
    assert.notOk(matchSimpleRoute('/1234', 'get', stubRoutes.standard));
});

it('should return true for /about/ handling trailing slash', function () {
    assert.ok(matchSimpleRoute('/about/', 'get', stubRoutes.standard));
});
});
