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
});
