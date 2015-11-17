/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , parseRoutes = require('./parseRoutes')
    , stubRoutes = require('../test_stubs/routes_stub.json');

describe('parseRoutes tests', () => {
    it('should export a function', () => {
        assert.isFunction(parseRoutes);
    });

    it('should return an object containing wildcard and standard routes', () => {
        const routes = parseRoutes(stubRoutes);

        assert.isObject(routes);
        assert.isObject(routes.wildcard);
        assert.isObject(routes.standard);
    });

    it('should return an object containing 2 wildcard routes', () => {
        const routes = parseRoutes(stubRoutes);

        assert.isObject(routes);
        assert.isObject(routes.wildcard['/:id']);
        assert.isObject(routes.wildcard['/api/articles/:id']);
    });

    it('should return a properly formatted route object for /:id', () => {
        const routes = parseRoutes(stubRoutes)
            , idRoute = routes.wildcard['/:id'];

        assert.isObject(routes);
        assert.isObject(idRoute);
        assert.isArray(idRoute.verbs);
        assert.isArray(idRoute.variables);
        assert.strictEqual(idRoute.eventId, '/:id');
        assert.typeOf(new RegExp(idRoute.regex), 'regexp');
    });

    it('should return an object containing 8 standard routes', () => {
        const routes = parseRoutes(stubRoutes);

        assert.isObject(routes);
        assert.isArray(routes.standard['/']);
        assert.isArray(routes.standard['/api/articles']);
        assert.isArray(routes.standard['/api']);
        assert.isArray(routes.standard['/api/search']);
        assert.isArray(routes.standard['/rss']);
        assert.isArray(routes.standard['/stuff']);
        assert.isArray(routes.standard['/search']);
        assert.isArray(routes.standard['/about']);
    });
});
