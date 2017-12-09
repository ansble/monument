

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
    , routeHandler
    , etag;

require('../utils/staticFileEtags');

test.beforeEach(() => {
  routeHandler = router(routeObject, config.set({
    publicPath: './test_stubs/deletes'
    , routePath: './test_stubs'
    , compression: 'none'
  }));

  res = createRes();

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

test.cb('should emit 404 & missing static events for missing file in sub of public', (t) => {
  req.url = '/static/somefile.js';

  events.required([ 'error:404', 'static:missing' ], (input) => {
    t.is(typeof input[0], 'object');
    t.is(typeof input[1], 'string');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should emit 404 & missing static event for a non-existant static file in public', (t) => {
  req.url = '/fakefile.js';

  events.once('error:404', (input) => {
    t.is(typeof input, 'object');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should return the file for an existing static file with no etag', (t) => {
  req.url = '/static/main.js';

  events.once('response', (input) => {
    t.is(typeof input, 'string');
    t.true(input.length > 0);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should return the file for an existing static file with no etag in base dir', (t) => {
  req.url = '/test.txt';

  events.once('response', (input) => {
    t.is(typeof input, 'string');
    t.true(input.length > 0);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should have a vary:accept-encoding header for static resources', (t) => {
  const successStatus = 200;

  req.url = '/static/main.js';
  req.method = 'get';
  req.headers['if-none-match'] = '';

  res.on('finish', () => {
    t.is(res.statusCode, successStatus);
    t.is(typeof res.headers, 'object');
    t.is(res.headers.Vary, 'Accept-Encoding');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should return a 304 for a valid etag match', (t) => {
  const unmodStatus = 304;

  req.url = '/static/main.js';
  req.headers['if-none-match'] = etag;

  res.on('finish', () => {
    t.is(res.statusCode, unmodStatus);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should return just headers if a head request is sent', (t) => {
  const successStatus = 200;

  req.url = '/static/main.js';
  req.method = 'head';
  req.headers['if-none-match'] = '';

  res.on('finish', () => {
    t.is(res.statusCode, successStatus);
    t.is(typeof res.headers, 'object');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});
