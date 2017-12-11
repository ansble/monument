

const test = require('ava'),
      router = require('./router'),
      events = require('harken'),
      routeObject = require('../test_stubs/routes_stub.json'),
      routerStore = require('./routeStore'),
      createRes = require('../test_stubs/utils/createRes'),
      config = require('../utils/config'),
      req = {
  method: 'GET',
  url: '/about',
  headers: {}
};

let res, routeHandler;

test.beforeEach(() => {
  config.reset();
  routerStore.clear();

  routeHandler = router(routeObject, config.set({
    publicPath: './test_stubs/deletes',
    routePath: './test_stubs',
    compression: 'none'
  }));

  res = createRes();

  Object.keys(routeObject).forEach(key => {
    events.off(`route:${key}:get`);
  });

  events.off('error:404');
  events.off('static:served');
  events.off('static:missing');
  events.off('response');
});

test.cb('should emit the correct route event for a simple route', t => {
  events.once('route:/about:get', connection => {
    t.is(typeof connection, 'object');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should emit the correct route event for a simple root route', t => {
  req.url = '/';

  events.once('route:/:get', connection => {
    t.is(typeof connection, 'object');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should emit the correct event for a two level deep simple route', t => {
  req.url = '/api/articles';

  events.once('route:/api/articles:get', connection => {
    t.is(typeof connection, 'object');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should emit the correct route event for another simple route', t => {
  req.url = '/search';

  events.once('route:/search:get', connection => {
    t.is(typeof connection, 'object');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('should emit the correct route event for the api simple route', t => {
  req.url = '/api';

  events.once('route:/api:get', connection => {
    t.is(typeof connection, 'object');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});