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
});
