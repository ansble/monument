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

describe('Router Tests:: compression routes', () => {
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

  it('should return status code 200 for valid gzip compression', (done) => {
    const successStatus = 200;

    req.method = 'GET';
    req.url = '/static/main.js';
    req.headers['accept-encoding'] = 'gzip';

    res.on('finish', () => {
      assert.strictEqual(res.statusCode, successStatus);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should have a content-encoding:gzip header for gzip compression', (done) => {
    res.on('finish', () => {
      assert.strictEqual(res.headers['Content-Encoding'], 'gzip');
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should serve a file as a response with gzip compression', (done) => {
    events.once('response', (input) => {
      assert.isString(input);
      assert.isAbove(input.length, 0);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should emit served static events for files with gzip compression', (done) => {
    events.once('static:served', (pathname) => {
      assert.strictEqual(pathname, req.url);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should return status code 200 for valid deflate compression', (done) => {
    const successStatus = 200;

    req.headers['accept-encoding'] = 'deflate';

    res.on('finish', () => {
      assert.strictEqual(res.statusCode, successStatus);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should have a content-encoding:deflate header for deflate compression', (done) => {
    res.on('finish', () => {
      assert.strictEqual(res.headers['Content-Encoding'], 'deflate');
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should serve a file as a response with deflate compression', (done) => {
    events.once('response', (input) => {
      assert.isString(input);
      assert.isAbove(input.length, 0);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should emit served static events for files with deflate compression', (done) => {
    events.once('static:served', (pathname) => {
      assert.strictEqual(pathname, req.url);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should have a content-encoding:br header for brötli compression', (done) => {
    req.headers['accept-encoding'] = 'br';

    res.on('finish', () => {
      assert.strictEqual(res.headers['Content-Encoding'], 'br');
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should serve a file as a response with brötli compression', (done) => {
    req.headers['accept-encoding'] = 'br';

    events.once('response', (input) => {
      assert.isString(input);
      assert.isAbove(input.length, 0);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });

  it('should emit served static events for files with brötli compression', (done) => {
    req.headers['accept-encoding'] = 'br';

    events.once('static:served', (pathname) => {
      assert.strictEqual(pathname, req.url);
      done();
    });

    process.nextTick(() => {
      routeHandler(req, res);
    });
  });
});
