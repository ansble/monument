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

describe('Router Tests:: static file routes', () => {
  let etag;

  beforeEach(() => {
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

    etag = '"49-MfNalQPJ0EarWoSLWttO6RHVTUI"';

    config.reset();
    routerStore.clear();

    events.off('error:404');
    events.off('static:served');
    events.off('static:missing');
    events.off('response');

    Object.keys(routeObject).forEach((key) => {
      events.off(`route:${key}:get`);
    });
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

  it('should emit 404 & missing static event for a non-existant static file in public', (done) => {
    req.url = '/fakefile.js';

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

  it('should return the file for an existing static file with no etag in base dir', (done) => {
    req.url = '/test.txt';

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
