'use strict';

const test = require('ava')
      , servers = []
      , events = require('harken')

      , spdy = require('spdy')
      , fs = require('fs')
      , path = require('path')
      , configStore = require('./utils/config');

test.beforeEach(() => {
  configStore.reset();
});

test.afterEach(() => {
  const shutDownEvents = events.required([ 'complete' ], () => {
    // t.end();
  });

  servers.forEach((server, i) => {
    shutDownEvents.add(`server:${i}`);
    server.close(() => {
      events.emit(`server:${i}`);
    });
  });

  events.emit('complete');
});

test.cb('should return an spdy server when spdy and correct params are passed in', (t) => {
  const spdyApp = require('./index');

  spdyApp.server({
    routeJSONPath: './test_stubs/routes_stub.json'
    , routePath: './test_stubs'
    , compress: false
    , server: spdy
    , port: 9995
    , serverOptions: {
      cert: fs.readFileSync(path.join(__dirname, './test_stubs/certs/test.crt'))
      , key: fs.readFileSync(path.join(__dirname, './test_stubs/certs/tests.key'))
      , ca: fs.readFileSync(path.join(__dirname, './test_stubs/certs/rootCA.key'))
    }
    , log: {
      log: () => {}
    }
  });

  spdyApp.events.once('server:started', (settings) => {
    servers.push(settings.server);
    t.true(settings.server instanceof spdy.Server);
    t.end();
  });
});
