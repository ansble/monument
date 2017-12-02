'use strict';

const test = require('ava')
      , router = require('./router')
      , events = require('harken')
      , routeObject = require('../test_stubs/routes_stub.json')
      , routerStore = require('./routeStore')
      , config = require('../utils/config')
      , stream = require('stream')
      , createRes = () => {
        const res = new stream.Writable();

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

        return res;
      }
      , req = {
        method: 'GET'
        , url: '/about'
        , headers: {}
      };

require('../utils/staticFileEtags');


test.beforeEach(() => {
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

test('should be defined as a function', (t) => {
  t.is(typeof router, 'function');
});

test('should return a function', (t) => {
  t.is(typeof router(routeObject, {
    publicPath: './test_stubs/deletes'
    , routePath: './test_stubs'
  }), 'function');
});

test.cb('should return x-powered-by only if it is set', (t) => {
  const tempHandler = router(routeObject, {
    publicPath: './test_stubs/deletes'
    , routePath: './test_stubs'
    , routesJSONPath: './test_stubs/routes_stub.json'
    , security: { poweredBy: 'waffles' }
    , statsd: false
  });

  events.once('route:/api/articles/:id:get', (connection) => {
    t.is(typeof connection.res.headers, 'object');
    t.is(connection.res.headers['X-Powered-By'], 'waffles');
    t.is(typeof connection, 'object');
    t.end();
  });

  req.url = '/api/articles/1235';

  process.nextTick(() => {
    tempHandler(req, createRes());
  });
});

test.cb('should by default not return x-powered-by ', (t) => {
  const routeHandler = router(routeObject, config.set({
    publicPath: './test_stubs/deletes'
    , routePath: './test_stubs'
    , compression: 'none'
  }));

  events.once('route:/about:get', (connection) => {
    t.is(connection.res.headers['X-Powered-By'], undefined);
    t.is(typeof connection, 'object');
    t.end();
  });

  req.url = '/about';

  process.nextTick(() => {
    routeHandler(req, createRes());
  });
});

test.cb('should emit the correct route event for a wildcard route', (t) => {
  const routeHandler = router(routeObject, config.set({
    publicPath: './test_stubs/deletes'
    , routePath: './test_stubs'
    , compression: 'none'
  }));

  req.url = '/api/articles/1234';

  events.once('route:/api/articles/:id:get', (connection) => {
    t.is(typeof connection, 'object');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, createRes());
  });
});

test.cb('should pass variables on the connection.params from the url', (t) => {
  const routeHandler = router(routeObject, config.set({
    publicPath: './test_stubs/deletes'
    , routePath: './test_stubs'
    , compression: 'none'
  }));

  req.url = '/api/articles/1234/links/daniel';

  events.once('route:/api/articles/:id/links/:item:get', (connection) => {
    t.is(typeof connection, 'object');
    t.is(connection.params.id, '1234');
    t.is(connection.params.item, 'daniel');
    t.end();
  });

  events.once('error:404', () => {
    throw new Error('bad route parsing');
  });

  process.nextTick(() => {
    routeHandler(req, createRes());
  });
});

test.cb('should emit the 404 route event for a 404 route', (t) => {
  const routeHandler = router(routeObject, config.set({
    publicPath: './test_stubs/deletes'
    , routePath: './test_stubs'
    , compression: 'none'
  }));

  req.url = '/about/daniel';

  events.once('error:404', (connection) => {
    t.is(typeof connection, 'object');
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, createRes());
  });
});

test.cb('should return the routes.json file when the router route is requested', (t) => {
  const routeHandler = router(routeObject, config.set({
    publicPath: './test_stubs/deletes'
    , routePath: './test_stubs'
    , compression: 'none'
  }));

  req.url = '/test_stubs';

  events.once('response', (result) => {
    const resultObject = JSON.parse(result);

    t.is(typeof resultObject, 'object');
    t.is(resultObject['/'][0], routeObject['/'][0]);
    t.end();
  });

  process.nextTick(() => {
    routeHandler(req, createRes());
  });
});
