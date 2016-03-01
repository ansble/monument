/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , app = require('./index')
    , http = require('http')
    , servers = []
    , events = require('harken')

    , http2 = require('http2')
    , spdy = require('spdy')
    , fs = require('fs')
    , path = require('path')
    , configStore = require('./utils/config');

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
        beforeEach(() => {
            configStore.reset();
        });

        afterEach((done) => {
            const shutDownEvents = events.required([ 'complete' ], () => {
                done();
            });

            servers.forEach((server, i) => {
                shutDownEvents.add(`server:${i}`);
                server.close(() => {
                    events.emit(`server:${i}`);
                });
            });

            events.emit('complete');
        });

        it('should return a server when run', (done) => {
            const server = app.server({
                routeJSONPath: './test_stubs/routes_stub.json'
                , routesPath: './test_stubs'
                , templatePath: './test_stubs/templates'
                , port: 9999
            });

            servers.push(server);
            setTimeout(() => {
                assert.instanceOf(server, http.Server);
                done();
            }, 50);
        });

        it('should return a server when run and no port passed in', (done) => {
            const server = require('./index').server({
                routeJSONPath: './test_stubs/routes_stub.json'
                , templatePath: './test_stubs/templates'
                , routesPath: './test_stubs'
            });

            servers.push(server);
            setTimeout(() => {
                assert.instanceOf(server, http.Server);
                done();
            }, 50);
        });

        it('should return a server when run and compress passed in', (done) => {
            const server = require('./index').server({
                routeJSONPath: './test_stubs/routes_stub.json'
                , templatePath: './test_stubs/templates'
                , compress: false
                , routesPath: './test_stubs'
            });

            servers.push(server);

            setTimeout(() => {
                assert.instanceOf(server, http.Server);
                done();
            }, 50);
        });

        it('should return an http2 server when http2 and correct params are passed in', (done) => {
            const server = require('./index').server({
                routeJSONPath: './test_stubs/routes_stub.json'
                , templatePath: './test_stubs/templates'
                , routesPath: './test_stubs'
                , compress: false
                , server: http2
                , serverOptions: {
                    cert: fs.readFileSync(path.join(__dirname, './test_stubs/certs/test.crt'))
                    , key: fs.readFileSync(path.join(__dirname, './test_stubs/certs/tests.key'))
                }
            });

            servers.push(server);

            setTimeout(() => {
                assert.instanceOf(server, http2.Server);
                done();
            }, 50);
        });

        it('should return an spdy server when spdy and correct params are passed in', (done) => {
            const server = require('./index').server({
                routeJSONPath: './test_stubs/routes_stub.json'
                , templatePath: './test_stubs/templates'
                , routesPath: './test_stubs'
                , compress: false
                , server: spdy
                , serverOptions: {
                    cert: fs.readFileSync(path.join(__dirname, './test_stubs/certs/test.crt'))
                    , key: fs.readFileSync(path.join(__dirname, './test_stubs/certs/tests.key'))
                    , ca: fs.readFileSync(path.join(__dirname, './test_stubs/certs/rootCA.key'))
                }
            });

            servers.push(server);

            setTimeout(() => {
                assert.instanceOf(server, spdy.Server);
                done();
            }, 50);
        });
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
            const regex = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

            assert.match(app.createUUID(), regex);
        });

        it('should not return the same uuid when called multiple times', () => {
            assert.notEqual(app.createUUID(), app.createUUID());
        });
    });
});
