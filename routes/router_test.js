'use strict';

const assert = require('chai').assert
    , router = require('./router')
    , events = require('harken')
    , routeObject = require('../test_stubs/routes_stub.json');

let req = {
        method: 'GET'
        , url: '/about'
        , headers: {}
    }
    , res = {

    }
    , routeHandler;

describe('Route Handler Tests', function () {
    beforeEach(function () {
        routeHandler = router(routeObject, {publicPath: './test_stubs'});
    });

    it('should be defined as a funciton', function () {
        assert.isFunction(router);
    });

    it('should return a function', function () {
        assert.isFunction(router(routeObject, {publicPath: './test_stubs/deletes'}));
    });

    describe('simple routes', () => {
        it('should emit the correct route event for a simple route', (done) => {
            events.once('route:/about:get', (connection) => {
                assert.isObject(connection);
                done();
            });

            routeHandler(req, res);
        });
    });

    describe('parameterized routes', () => {
        it('should emit the correct route event for a wildcard route', (done) => {
            req.url = '/api/articles/1234';

            events.once('route:/api/articles/:id:get', (connection) => {
                assert.isObject(connection);
                done();
            });

            routeHandler(req, res);
        });

        it('should pass variables on the connection.params from the url', (done) => {
            req.url = '/api/articles/1234/links/daniel';

            events.once('route:/api/articles/:id/links/:item:get', (connection) => {
                assert.isObject(connection);
                assert.strictEqual(connection.params.id, '1234');
                assert.strictEqual(connection.params.item, 'daniel');
                done();
            });

            routeHandler(req, res);
        });
    });

    describe('404 routes', () => {
        it('should emit the 404 route event for a 404 route', (done) => {
            req.url = '/about/daniel';

            events.once('error:404', (connection) => {
                assert.isObject(connection);
                done();
            });

            routeHandler(req, res);
        });
    });

    describe('static file routes', () => {

        it('should emit 404 event for a non-existant file', (done) => {
            req.url = './test_stubs/deletes/somefile.js';
            events.required(['error:404', 'static:missing'], (input) => {
                assert.isObject(input[0]);
                assert.isString(input[1]);
                done();
            });

            routeHandler(req, res);
        });
    });
});
