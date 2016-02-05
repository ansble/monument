/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , router = require('./router')
    , events = require('harken')
    , routeObject = require('../test_stubs/routes_stub.json')
    , stream = require('stream')
    , config = require('../utils/config')
    , req = {
        method: 'GET'
        , url: '/about'
        , headers: {}
    };

let res
    , routeHandler;

describe('Route Handler Tests', () => {
    beforeEach(() => {
        config.reset();

        routeHandler = router(routeObject, {
            publicPath: './test_stubs/deletes'
            , routesPath: './test_stubs'
        });

        res = new stream.Writable();

        res.setHeader = function (name, value) {
            this.headers[name] = value;
        };

        res.writeHead = function (status, headers) {
            this.statusCode = status;
            this.headers = Object.keys(headers).reduce((prevIn, key) => {
                const prev = prevIn;

                prev[key] = headers[key];

                return prev;
            }, this.headers);
        };

        res.statusCode = 0;
        res.headers = {};
        /* eslint-disable no-underscore-dangle */
        res._write = function (chunk, enc, cb) {
            const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);

            events.emit('response', buffer.toString());
            cb();
        };
        /* eslint-enable no-underscore-dangle */

        events.off('error:404');
        events.off('static:missing');
        events.off('response');
        events.off('route:/about:get');
        events.off('route:/api/articles/:id:get');
    });

    it('should be defined as a function', () => {
        assert.isFunction(router);
    });

    it('should return a function', () => {
        assert.isFunction(router(routeObject, { publicPath: './test_stubs/deletes' }));
    });

    describe('simple routes', () => {
        it('should emit the correct route event for a simple route', (done) => {
            events.once('route:/about:get', (connection) => {
                assert.isObject(connection);
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });
    });

    describe('security headers', () => {
        it('should return x-powered-by only if it is set', (done) => {
            const tempHandler = router(routeObject, {
                publicPath: './test_stubs/deletes'
                , security: { poweredBy: 'waffles' }
            });

            events.once('route:/about:get', (connection) => {
                assert.isObject(connection.res.headers);
                assert.strictEqual(connection.res.headers['X-Powered-By'], 'waffles');
                assert.isObject(connection);
                done();
            });

            tempHandler(req, res);
        });

        it('should by default not return x-powered-by ', (done) => {
            events.once('route:/about:get', (connection) => {
                assert.strictEqual(connection.res.headers['X-Powered-By'], undefined);
                assert.isObject(connection);
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });
    });

    describe('parameterized routes', () => {
        it('should emit the correct route event for a wildcard route', (done) => {
            req.url = '/api/articles/1234';

            events.once('route:/api/articles/:id:get', (connection) => {
                assert.isObject(connection);
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });

        it('should pass variables on the connection.params from the url', (done) => {
            req.url = '/api/articles/1234/links/daniel';

            events.once('route:/api/articles/:id/links/:item:get', (connection) => {
                assert.isObject(connection);
                assert.strictEqual(connection.params.id, '1234');
                assert.strictEqual(connection.params.item, 'daniel');
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });
    });

    describe('404 routes', () => {
        it('should emit the 404 route event for a 404 route', (done) => {
            req.url = '/about/daniel';

            events.once('error:404', (connection) => {
                assert.isObject(connection);
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });
    });

    describe('static file routes', () => {
        let etag;

        beforeEach(() => {
            etag = '"4b-ah1/iPV1wknehHVYGkU4jQ"';
        });

        it('should emit 404 & missing static events for missing file in sub of public', (done) => {
            req.url = '/static/somefile.js';

            events.required([ 'error:404', 'static:missing' ], (input) => {
                assert.isObject(input[0]);
                assert.isString(input[1]);
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });

        it('should emit 404 event for a non-existant static file in the root of public', (done) => {
            req.url = '/static/somefile.js';

            events.once('error:404', (input) => {
                assert.isObject(input);
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });

        it('should return the file for an existing static file with no etag', (done) => {
            req.url = '/static/main.js';

            events.once('response', (input) => {
                assert.isString(input);
                assert.isAbove(input.length, 0);
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });

        it('should have a vary:accept-encoding header for static resources', (done) => {
            const successStatus = 200;

            req.url = '/static/main.js';
            req.method = 'get';
            req.headers['if-none-match'] = '';

            res.on('finish', () => {
                assert.strictEqual(res.statusCode, successStatus);
                assert.isObject(res.headers);
                assert.strictEqual(res.headers.Vary, 'Accept-Encoding');
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });

        it('should return a 304 for a valid etag match', (done) => {
            const unmodStatus = 304;

            req.url = '/static/main.js';
            req.headers['if-none-match'] = etag;

            res.on('finish', () => {
                assert.strictEqual(res.statusCode, unmodStatus);
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });

        it('should return just headers if a head request is sent', (done) => {
            const successStatus = 200;

            req.url = '/static/main.js';
            req.method = 'head';
            req.headers['if-none-match'] = '';

            res.on('finish', () => {
                assert.strictEqual(res.statusCode, successStatus);
                assert.isObject(res.headers);
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });
        });
    });

    describe('route.json route', () => {
        it('should return the routes.json file when the router route is requested', (done) => {
            req.url = '/routes';

            events.once('response', (result) => {
                const resultObject = JSON.parse(result);

                assert.isObject(resultObject);
                assert.strictEqual(resultObject['/'][0], routeObject['/'][0]);
                done();
            });

            process.nextTick(() => {
                routeHandler(req, res);
            });

        });
    });
});
