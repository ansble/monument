/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , server = require('./index');


describe('Routing Tests', () => {
    // let routeObject;

    // beforeEach(() => {
    //     routeObject = require('../test_stubs/routes_stub.json');
    // });

    it('should return a function that starts a server', () => {
        assert.isFunction(server.server);
    });

    it('should have a parseWildCardRoute function', () => {
        assert.isFunction(server.parseWildCardRoute);
    });

    it('should have a isWildCardRoute function', () => {
        assert.isFunction(server.isWildCardRoute);
    });
});
