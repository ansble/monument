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
      , events = require('harken')
      , routeObject = require('../test_stubs/routes_stub.json')
      , path = require('path')
      , routerStore = require('./routeStore')
      , config = require('../utils/config')
      , req = {
        method: 'GET'
        , url: '/about'
        , headers: {}
      }
      , setup = () => {
        config.reset();
        routerStore.clear();

        Object.keys(routeObject).forEach((key) => {
          events.off(`route:${key}:get`);
        });

        events.off('error:404');
        events.off('static:served');
        events.off('static:missing');
        events.off('response');
      };

test.after(() => {
  mock.stopAll();
});

test.afterEach(() => {
  statsd.clear();
});

test.cb('when configured sends route and route status to statsd for each request', (t) => {
  setup();

  const sendKey = 'http.get./api/articles/1234/links/daniel.status_code.200'
        , testRouter = router(routeObject, {
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

  req.url = '/api/articles/1234/links/daniel';

  events.once('route:/api/articles/:id/links/:item:get', (connection) => {
    t.is(typeof connection, 'object');

    connection.res.once('finish', () => {
      t.is(statsd.store.send, sendKey);
      t.end();
    });

    connection.res.statusCode = 200;
    connection.res.end();
  });

  events.once('error:404', () => {
    throw new Error('bad route parsing');
  });

  process.nextTick(() => {
    testRouter(req, createRes());
  });
});

test.cb('when configured sends timing information and route with each wildcard request', (t) => {
  setup();
  const timingKey = 'http.get./api/articles/1234/links/daniel.response_time'
        , testRouter = router(routeObject, {
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

  req.url = '/api/articles/1234/links/daniel';

  events.once('route:/api/articles/:id/links/:item:get', (connection) => {
    t.is(typeof connection, 'object');

    connection.res.once('finish', () => {
      t.is(statsd.store.timing, timingKey);

      t.end();
    });

    connection.res.statusCode = 200;
    connection.res.end();
  });

  events.once('error:404', () => {
    throw new Error('bad route parsing');
  });

  process.nextTick(() => {
    testRouter(req, createRes());
  });
});

// test.cb('when configured sends timing information and route with each standard request', (t) => {
//   const timingKey = 'http.get./about.response_time';

//   req.url = '/about';

//   events.once('route:/about:get', (connection) => {
//     t.is(typeof connection, 'object');

//     connection.res.once('finish', () => {
//       t.is(statsd.store.timing, timingKey);

//       t.end();
//     });

//     connection.res.end();
//   });

//   events.once('error:404', () => {
//     throw new Error('bad route parsing');
//   });

//   process.nextTick(() => {
//     routeHandler(req, res);
//   });
// });

test.cb('when not configured does not send anything to statsd for each standard request', (t) => {
  setup();

  const testRouter = router(routeObject, {
    publicPath: path.join(process.cwd(), './test_stubs/deletes')
    , routePath: path.join(process.cwd(), './test_stubs')
    , compression: 'none'
    , statsd: false
  });

  req.url = '/search';

  events.once('route:/search:get', (connection) => {
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
    testRouter(req, createRes());
  });
});

// test.cb('when not configured does not send anything to statsd for each wildcard request', (t) => {
//   routeHandler = router(routeObject, {
//     publicPath: path.join(process.cwd(), './test_stubs/deletes')
//     , routePath: path.join(process.cwd(), './test_stubs')
//     , compression: 'none'
//     , statsd: false
//   });

//   req.url = '/api/articles/1234';

//   events.once('route:/api/articles/:id:get', (connection) => {
//     t.is(typeof connection, 'object');

//     connection.res.once('finish', () => {
//       t.is(statsd.store.send, '');
//       t.is(statsd.store.timing, '');

//       t.end();
//     });

//     connection.res.end();
//   });

//   events.once('error:404', () => {
//     throw new Error('bad route parsing');
//   });

//   process.nextTick(() => {
//     routeHandler(req, res);
//   });
// });
