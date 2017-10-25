'use strict';

const test = require('ava')
      , router = require('./router')
      , events = require('harken')
      , routeObject = require('../test_stubs/routes_stub.json')
      , createRes = require('../test_stubs/utils/createRes')
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

test.beforeEach(() => {
  config.reset();
  routerStore.clear();

  routeHandler = router(routeObject, config.set({
    publicPath: './test_stubs/deletes'
    , routePath: './test_stubs'
    , compression: 'none'
  }));

  res = createRes();

  // res.setHeader = function (name, value) {
  //   this.headers[name] = value;
  // };

  // res.writeHead = function (status, headers = {}) {
  //   this.statusCode = status;
  //   this.headers = Object.keys(headers).reduce((prevIn, key) => {
  //     const prev = prevIn;

  //     prev[key] = headers[key];

  //     return prev;
  //   }, this.headers);
  // };

  // res.statusCode = 0;
  // res.headers = {};
  // /* eslint-disable no-underscore-dangle */
  // res._write = function (chunk, enc, cb) {
  //   const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);

  //   events.emit('response', buffer.toString());
  //   cb();
  // };
  /* eslint-enable no-underscore-dangle */

  Object.keys(routeObject).forEach((key) => {
    events.off(`route:${key}:get`);
  });

  events.off('error:404');
  events.off('static:served');
  events.off('static:missing');
  events.off('response');
});

test.cb('should return status code 200 for valid gzip compression', (t) => {
  const successStatus = 200;

  req.method = 'GET';
  req.url = '/static/main.js';
  req.headers['accept-encoding'] = 'gzip';

  res.on('finish', () => {
    t.is(res.statusCode, successStatus);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should have a content-encoding:gzip header for gzip compression', (t) => {
  res.on('finish', () => {
    t.is(res.headers['Content-Encoding'], 'gzip');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should serve a file as a response with gzip compression', (t) => {
  events.once('response', (input) => {
    t.is(typeof input, 'string');
    t.is(input.length > 0);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should emit served static events for files with gzip compression', (t) => {
  events.once('static:served', (pathname) => {
    t.is(pathname, req.url);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should return status code 200 for valid deflate compression', (t) => {
  const successStatus = 200;

  req.headers['accept-encoding'] = 'deflate';

  res.on('finish', () => {
    t.is(res.statusCode, successStatus);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should have a content-encoding:deflate header for deflate compression', (t) => {
  res.on('finish', () => {
    t.is(res.headers['Content-Encoding'], 'deflate');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should serve a file as a response with deflate compression', (t) => {
  events.once('response', (input) => {
    t.is(typeof input, 'string');
    t.is(input.length > 0);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should emit served static events for files with deflate compression', (t) => {
  events.once('static:served', (pathname) => {
    t.is(pathname, req.url);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should have a content-encoding:br header for brötli compression', (t) => {
  req.headers['accept-encoding'] = 'br';

  res.on('finish', () => {
    t.is(res.headers['Content-Encoding'], 'br');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should serve a file as a response with brötli compression', (t) => {
  req.headers['accept-encoding'] = 'br';

  events.once('response', (input) => {
    t.is(typeof input, 'string');
    t.is(input.length > 0);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should emit served static events for files with brötli compression', (t) => {
  req.headers['accept-encoding'] = 'br';

  events.once('static:served', (pathname) => {
    t.is(pathname, req.url);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});
