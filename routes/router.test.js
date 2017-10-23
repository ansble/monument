/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , router = require('./router')
      , events = require('harken')
      , routeObject = require('../test_stubs/routes_stub.json')
      , stream = require('stream')
      , routerStore = require('./routeStore')
      , config = require('../utils/config')
      , req = {
        method: 'GET'
        , url: '/about'
        , headers: {}
      };

let res
    , routeHandler;

require('../utils/staticFileEtags');

describe('Route Handler Tests', () => {
  beforeEach(() => {
    config.reset();
    routerStore.clear();

    routeHandler = router(routeObject, config.set({
      publicPath: './test_stubs/deletes'
      , routePath: './test_stubs'
      , compression: 'none'
    }));

    res = new stream.Writable();

    res.setHeader = function (name, value) {
      this.headers[name] = value;
    };

    res.writeHead = function (status, headers = {}) {
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
    events.off('static:served');
    events.off('static:missing');
    events.off('response');

    Object.keys(routeObject).forEach((key) => {
      events.off(`route:${key}:get`);
    });
  });

  it('should be defined as a function', () => {
    assert.isFunction(router);
  });

  it('should return a function', () => {
    assert.isFunction(router(routeObject, {
      publicPath: './test_stubs/deletes'
      , routePath: './test_stubs'
    }));
  });

  describe('security headers', () => {
    it('should return x-powered-by only if it is set', (done) => {
      const tempHandler = router(routeObject, {
        publicPath: './test_stubs/deletes'
        , routePath: './test_stubs'
        , routesJSONPath: './test_stubs/routes_stub.json'
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

      events.once('error:404', () => {
        throw new Error('bad route parsing');
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

  describe('route.json route', () => {
    it('should return the routes.json file when the router route is requested', (done) => {
      req.url = '/test_stubs';

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
