var assert = require('chai').assert
	, server = require('./index')

    , routeObject;

describe('Routing Tests', function () {
	'use strict';

    beforeEach(function () {
        routeObject = require('../test_stubs/routes_stub.json');
    });

	it('should return a function that starts a server', function () {
		assert.isFunction(server.server);
	});

	it('should have a parseWildCardRoute function', function () {
		assert.isFunction(server.parseWildCardRoute);
	});

	it('should have a isWildCardRoute function', function () {
		assert.isFunction(server.isWildCardRoute);
	});

    describe('parseRoutes tests', function () {
        it('should return an object containing wildcard and standard routes', function () {
            var routes = server.parseRoutes(routeObject);

            assert.isObject(routes);
            assert.isObject(routes.wildcard);
            assert.isObject(routes.standard);
        });

        it('should return an object containing 2 wildcard routes', function () {
            var routes = server.parseRoutes(routeObject);

            assert.isObject(routes);
            assert.isObject(routes.wildcard['/:id']);
            assert.isObject(routes.wildcard['/api/articles/:id']);
        });

        it('should return a properly formatted route object for /:id', function () {
            var routes = server.parseRoutes(routeObject)
                , idRoute = routes.wildcard['/:id'];

            assert.isObject(routes);
            assert.isObject(idRoute);
            assert.isArray(idRoute.verbs);
            assert.isArray(idRoute.variables);
            assert.strictEqual(idRoute.eventId, '/:id');
            assert.typeOf(new RegExp(idRoute.regex), 'regexp');
        });

        it('should return an object containing 8 standard routes', function () {
            var routes = server.parseRoutes(routeObject);

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

    describe('isWildCardRoute tests', function () {
        it('should identify /:id as a wildcard route for GET requests', function () {
            assert.ok(server.isWildCardRoute('/1234', 'get', server.parseRoutes(routeObject).wildcard));
        });

        it('should not identify /:id as a wildcard route for POST requests', function () {
            assert.notOk(server.isWildCardRoute('/1234', 'post', server.parseRoutes(routeObject).wildcard));
        });

        it('should not identify /:id/bob as a wildcard route', function () {
            assert.notOk(server.isWildCardRoute('/1234/bob', 'get', server.parseRoutes(routeObject).wildcard));
        });
    });

    describe('Wildcard route parsing tests', function () {
        it('should properly parse a wildcard route', function () {
            var routeObj = server.parseWildCardRoute('/1234', server.parseRoutes(routeObject).wildcard);

            assert.isObject(routeObj);
            assert.strictEqual(routeObj.values.id, '1234');
            assert.isObject(routeObj.route);
        });
    });

    describe('matchSimpleRoute tests', function () {
        it('should return true for /about', function () {
            assert.ok(server.matchSimpleRoute('/about', 'get', server.parseRoutes(routeObject).standard));
        });

        it('should return true for /', function () {
            assert.ok(server.matchSimpleRoute('/', 'get', server.parseRoutes(routeObject).standard));
        });

        it('should not match for /:id', function () {
            assert.notOk(server.matchSimpleRoute('/1234', 'get', server.parseRoutes(routeObject).standard));
        });

        it('should return true for /about/ handling trailing slash', function () {
            assert.ok(server.matchSimpleRoute('/about/', 'get', server.parseRoutes(routeObject).standard));
        });
    });

});
