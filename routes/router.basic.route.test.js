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

describe('Router Tests:: simple routes', () => {
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

    Object.keys(routeObject).forEach((key) => {
      events.off(`route:${key}:get`);
    });

    events.off('error:404');
    events.off('static:served');
    events.off('static:missing');
    events.off('response');
  });

  it('should emit the correct route event for a simple route', (done) => {
    events.once('route:/about:get', (connection) => {
      assert.isObject(connection);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should emit the correct route event for a simple root route', (done) => {
    req.url = '/';

    events.once('route:/:get', (connection) => {
      assert.isObject(connection);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should emit the correct event for a two level deep simple route', (done) => {
    req.url = '/api/articles';

    events.once('route:/api/articles:get', (connection) => {
      assert.isObject(connection);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should emit the correct route event for another simple route', (done) => {
    req.url = '/search';

    events.once('route:/search:get', (connection) => {
      assert.isObject(connection);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should emit the correct route event for the api simple route', (done) => {
    req.url = '/api';

    events.once('route:/api:get', (connection) => {
      assert.isObject(connection);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });
});
