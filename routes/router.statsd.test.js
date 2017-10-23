/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , mock = require('mock-require')

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


describe('Router Tests:: statsd tests', () => {
  beforeEach(() => {
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

    res = new stream.Writable();

    res.setHeader = function (name, value) {
      this.headers[name] = value;
    };

    res.writeHead = function (status, headers) {
      this.statusCode = status;
      this.headers = Object.keys(headers).reduce((prevIn, key) => {
        const prev = prevIn;

        prev[key] = headers[key];

        return prev;
      }, this.headers);
    };

    res.statusCode = 200;
    res.headers = {};
    /* eslint-disable no-underscore-dangle */
    res._write = function (chunk, enc, cb) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);

      events.emit('response', buffer.toString());
      cb();
    };
    /* eslint-enable no-underscore-dangle */
  });

  after(() => {
    mock.stopAll();
  });

  afterEach(() => {
    statsd.clear();
  });

  describe('when configured', () => {
    it('sends route and route status to statsd for each request', (done) => {
      const sendKey = 'http.get./api/articles/1234/links/daniel.status_code.200';

      req.url = '/api/articles/1234/links/daniel';

      events.once('route:/api/articles/:id/links/:item:get', (connection) => {
        assert.isObject(connection);

        connection.res.once('finish', () => {
          assert.strictEqual(statsd.store.send, sendKey);

          done();
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

    it('sends route and route status to statsd for each request', (done) => {
      const sendKey = 'http.get./about.status_code.200';

      req.url = '/about';

      events.once('route:/about:get', (connection) => {
        assert.isObject(connection);

        connection.res.once('finish', () => {
          assert.strictEqual(statsd.store.send, sendKey);

          done();
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

    it('sends timing information and route with each wildcard request', (done) => {
      const timingKey = 'http.get./api/articles/1234/links/daniel.response_time';

      req.url = '/api/articles/1234/links/daniel';

      events.once('route:/api/articles/:id/links/:item:get', (connection) => {
        assert.isObject(connection);

        connection.res.once('finish', () => {
          assert.strictEqual(statsd.store.timing, timingKey);

          done();
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

    it('sends timing information and route with each standard request', (done) => {
      const timingKey = 'http.get./about.response_time';

      req.url = '/about';

      events.once('route:/about:get', (connection) => {
        assert.isObject(connection);

        connection.res.once('finish', () => {
          assert.strictEqual(statsd.store.timing, timingKey);

          done();
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
  });

  describe('when not configured', () => {
    beforeEach(() => {
      routeStore.clear();

      routeHandler = router(routeObject, {
        publicPath: path.join(process.cwd(), './test_stubs/deletes')
        , routePath: path.join(process.cwd(), './test_stubs')
        , compression: 'none'
        , statsd: false
      });
    });

    it('does not send anything to statsd for each standard request', (done) => {
      req.url = '/about';

      events.once('route:/about:get', (connection) => {
        assert.isObject(connection);

        connection.res.once('finish', () => {
          assert.strictEqual(statsd.store.send, '');
          assert.strictEqual(statsd.store.timing, '');

          done();
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

    it('does not send anything to statsd for each wildcard request', (done) => {
      req.url = '/api/articles/1234';

      events.once('route:/api/articles/:id:get', (connection) => {
        assert.isObject(connection);

        connection.res.once('finish', () => {
          assert.strictEqual(statsd.store.send, '');
          assert.strictEqual(statsd.store.timing, '');

          done();
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
  });
});
