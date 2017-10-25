/* eslint-env node, mocha */
'use strict';

const test = require('ava')
      , mock = require('mock-require')
      , createRes = require('../test_stubs/utils/createRes')
      /* eslint-disable no-unused-vars */
      , statsdReq = mock('../utils/statsd', {
        store: {
          send: ''
          , timing: ''
        }

        , clear: function () {
          this.store = {
            send: ''
            , timing: ''
          };
        }

        , create: function () {
          return {
            send: (message) => {
              console.log('mocked statsd send!');
              this.store.send = message;
            }
            , timing: (message) => {
              this.store.timing = message;
            }
          };
        }
      })
      /* eslint-enable no-unused-vars */

      , statsd = require('../utils/statsd')
      , router = require('./router')
      , routeStore = require('./routeStore')
      , events = require('harken')
      , routeObject = require('../test_stubs/routes_stub.json')
      , path = require('path')
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

test.beforeEach(() => {
  config.reset();
  routerStore.clear();

  routeHandler = router(routeObject, {
    publicPath: path.join(process.cwd(), './test_stubs/deletes')
    , routePath: path.join(process.cwd(), './test_stubs')
    , compression: 'none'
    , statsd: {
      host: 'statsd.server'
      , port: '42'
    }
    , log: {
      log: () => {}
      , error: () => {}
    }
  });

  Object.keys(routeObject).forEach((key) => {
    events.off(`route:${key}:get`);
  });

  events.off('error:404');
  events.off('static:served');
  events.off('static:missing');
  events.off('response');

  res = createRes();

  // res.setHeader = function (name, value) {
  //   this.headers[name] = value;
  // };

  // res.writeHead = function (status, headers) {
  //   this.statusCode = status;
  //   this.headers = Object.keys(headers).reduce((prevIn, key) => {
  //     const prev = prevIn;

  //     prev[key] = headers[key];

  //     return prev;
  //   }, this.headers);
  // };

  // res.statusCode = 200;
  // res.headers = {};
  // /* eslint-disable no-underscore-dangle */
  // res._write = function (chunk, enc, cb) {
  //   const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);

  //   events.emit('response', buffer.toString());
  //   cb();
  // };
  /* eslint-enable no-underscore-dangle */
});

test.after(() => {
  mock.stopAll();
});

test.afterEach(() => {
  statsd.clear();
});

test.cb('when configured sends route and route status to statsd for each request', (t) => {
  const sendKey = 'http.get./api/articles/1234/links/daniel.status_code.200';

  req.url = '/api/articles/1234/links/daniel';

  events.once('route:/api/articles/:id/links/:item:get', (connection) => {
    t.is(typeof connection, 'object');

    connection.res.once('finish', () => {
      t.is(statsd.store.send, sendKey);

      t.end();
    });

    connection.res.end();
  });

  events.once('error:404', () => {
    throw new Error('bad route parsing');
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('when configured sends route and route status to statsd for each request', (t) => {
  const sendKey = 'http.get./about.status_code.200';

  req.url = '/about';

  events.once('route:/about:get', (connection) => {
    t.is(typeof connection, 'object');

    connection.res.once('finish', () => {
      t.is(statsd.store.send, sendKey);

      t.end();
    });

    connection.res.end();
  });

  events.once('error:404', () => {
    throw new Error('bad route parsing');
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('when configured sends timing information and route with each wildcard request', (t) => {
  const timingKey = 'http.get./api/articles/1234/links/daniel.response_time';

  req.url = '/api/articles/1234/links/daniel';

  events.once('route:/api/articles/:id/links/:item:get', (connection) => {
    t.is(typeof connection, 'object');

    connection.res.once('finish', () => {
      t.is(statsd.store.timing, timingKey);

      t.end();
    });

    connection.res.end();
  });

  events.once('error:404', () => {
    throw new Error('bad route parsing');
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('when configured sends timing information and route with each standard request', (t) => {
  const timingKey = 'http.get./about.response_time';

  req.url = '/about';

  events.once('route:/about:get', (connection) => {
    t.is(typeof connection, 'object');

    connection.res.once('finish', () => {
      t.is(statsd.store.timing, timingKey);

      t.end();
    });

    connection.res.end();
  });

  events.once('error:404', () => {
    throw new Error('bad route parsing');
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('when not configured does not send anything to statsd for each standard request', (t) => {
  routeHandler = router(routeObject, {
    publicPath: path.join(process.cwd(), './test_stubs/deletes')
    , routePath: path.join(process.cwd(), './test_stubs')
    , compression: 'none'
    , statsd: false
  });

  req.url = '/about';

  events.once('route:/about:get', (connection) => {
    t.is(typeof connection, 'object');

    connection.res.once('finish', () => {
      t.is(statsd.store.send, '');
      t.is(statsd.store.timing, '');

      t.end();
    });

    connection.res.end();
  });

  events.once('error:404', () => {
    throw new Error('bad route parsing');
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});

test.cb('when not configured does not send anything to statsd for each wildcard request', (t) => {
  routeHandler = router(routeObject, {
    publicPath: path.join(process.cwd(), './test_stubs/deletes')
    , routePath: path.join(process.cwd(), './test_stubs')
    , compression: 'none'
    , statsd: false
  });

  req.url = '/api/articles/1234';

  events.once('route:/api/articles/:id:get', (connection) => {
    t.is(typeof connection, 'object');

    connection.res.once('finish', () => {
      t.is(statsd.store.send, '');
      t.is(statsd.store.timing, '');

      t.end();
    });

    connection.res.end();
  });

  events.once('error:404', () => {
    throw new Error('bad route parsing');
  });

  process.nextTick(() => {
    routeHandler(req, res);
  });
});
