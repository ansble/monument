var assert = require('chai').assert
    , app = require('./index')
    , http = require('http')
    , server;

describe('The main monument tests', function () {
  'use strict';

    it('should be correctly defined', function () {
        assert.isFunction(app.server);
        assert.isFunction(app.parser);
        assert.isObject(app.events);
    });

    describe('Parser Tests', function () {
        it('should have a parser method', function () {
            assert.isFunction(app.parser);
        });
    });

    describe('Wrapper Tests', function () {
        afterEach(function () {
          server.close();
        });

        it('should return a server when run', function () {
          server = app.server({
            routeJSONPath: './test_stubs/routes_stub.json'
            , templatePath: './test_stubs/templates'
            , port: 9999
          });

          assert.instanceOf(server, http.Server);
        });
    });

    describe('Compression Tests', function () {
        it('should compress things by default');
        it('should not compress things if compression is turned off');
    });

    describe('doTjs Tests', function () {
        it('should use doTjs defaults if none are set');
        it('should override doTjs specified defaults when set');
        it('should ignore irrelevant config keys');
    });
});
