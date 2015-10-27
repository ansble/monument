'use strict';

const assert = require('chai').assert
    , isWildCardRoute = require('./isWildCardRoute')
    , parseRoutes = require('./parseRoutes')
    , stubRoutes = parseRoutes(require('../test_stubs/routes_stub.json'));

describe('isWildCardRoute Tests', () => {
    it('should return a function', () => {
        assert.isFunction(isWildCardRoute);
    });

    it('should return true if a wildcard route is passed in', () => {
        assert.isTrue(isWildCardRoute('/john-wayne', 'get', stubRoutes.wildcard));
        assert.isTrue(isWildCardRoute('/api/articles/1234', 'get', stubRoutes.wildcard));
    });

    it('should return false if a wildcard route is passed in but the verb mismatches', () => {
        assert.isFalse(isWildCardRoute('/john-wayne', 'post', stubRoutes.wildcard));
    });

    it('should return false if the route doesn\'t match any patterns', () => {
        assert.isFalse(isWildCardRoute('/api/search', 'get', stubRoutes.wildcard));
    });
});
