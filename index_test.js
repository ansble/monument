/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , app = require('./index')
    , http = require('http');

let server;

describe('The main monument tests', () => {

    it('should be correctly defined', () => {
        assert.isFunction(app.server);
        assert.isFunction(app.parser);
        assert.isObject(app.events);
    });

    describe('Parser Tests', () => {
        it('should have a parser method', () => {
            assert.isFunction(app.parser);
        });
    });

    describe('Wrapper Tests', () => {
        afterEach(() => {
            server.close();
        });

        it('should return a server when run', () => {
            server = app.server({
                routeJSONPath: './test_stubs/routes_stub.json'
                , templatePath: './test_stubs/templates'
                , port: 9999
            });

            assert.instanceOf(server, http.Server);
        });
    });

    describe('Compression Tests', () => {
        it('should compress things by default');
        it('should not compress things if compression is turned off');
    });

    describe('doTjs Tests', () => {
        it('should use doTjs defaults if none are set');
        it('should override doTjs specified defaults when set');
        it('should ignore irrelevant config keys');
    });

    describe('uuid tests', () => {
        it('should have a createUUID function', () => {
            assert.isFunction(app.createUUID);
        });

        it('should return a uuid when called', () => {
            assert.match(app.createUUID(), /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
        });

        it('should not return the same uuid when called multiple times', () => {
            assert.notEqual(app.createUUID(), app.createUUID());
        });
    });
});
