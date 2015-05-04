var assert = require('chai').assert
	, server = require('./index')
	, events = require('./emitter')

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

	it('should have a parseRoutes function', function () {
		assert.isFunction(server.parseRoutes);
	});

    describe('parseRoutes tests', function () {
        it('should return an object containing wildcard and standard routes', function () {
            var routes = server.parseRoutes(routeObject);

            assert.isObject(routes);
            assert.isObject(routes.wildCard);
            assert.isObject(routes.standard);
        });
    });

});
