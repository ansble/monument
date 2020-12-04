'use strict';

const test = require('ava')
      , app = require('./index')
      , http = require('http')
      , servers = []
      , events = require('harken')
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

test('should be correctly defined', (t) => {
  t.is(typeof app.server, 'function');
  t.is(typeof app.parser, 'function');
  t.is(typeof app.routes, 'object');
  t.is(typeof app.events, 'object');
});

test('should have a parser method', (t) => {
  t.is(typeof app.parser, 'function');
});

test.cb('should return a server when run', (t) => {
  app.server({
    routeJSONPath: './test_stubs/routes_stub.json'
    , routePath: './test_stubs'
    , port: 9999
    , log: {
      log: () => {}
    }
  });

  app.events.once('server:started', (settings) => {
    servers.push(settings.server);
    t.true(settings.server instanceof http.Server);
    t.end();
  });
});

test.cb('should return a server when run and no port passed in', (t) => {
  const noPortApp = require('./index');

  noPortApp.server({
    routeJSONPath: './test_stubs/routes_stub.json'
    , routePath: './test_stubs'
    , port: 9998
    , log: {
      log: () => {}
    }
  });

  test.cb('should return a server when run with wrong port passed in', (t) => {
    const noPortApp = require('./index');
  
    t.not(noPortApp.server({
      routeJSONPath: './test_stubs/routes_stub.json'
      , routePath: './test_stubs'
      , port: 'qwerty'
      , log: {
        log: () => {}
      }
    }));

  noPortApp.events.once('server:started', (settings) => {
    servers.push(settings.server);
    t.true(settings.server instanceof http.Server);
    t.end();
  });
});

test.cb('should return a server when run and compress passed in', (t) => {
  const compressApp = require('./index');

  compressApp.server({
    routeJSONPath: './test_stubs/routes_stub.json'
    , compress: false
    , routePath: './test_stubs'
    , port: 9997
    , log: {
      log: () => {}
    }
  });

  test.cb('should return a server when run and compress passed in', (t) => {
    const compressApp = require('./index');
  
    compressApp.server({
      routeJSONPath: './test_stubs/routes_stub.json'
      , compress: true
      , routePath: './test_stubs'
      , port: 9997
      , log: {
        log: () => {}
      }
    });

  compressApp.events.once('server:started', (settings) => {
    servers.push(settings.server);
    t.true(settings.server instanceof http.Server);
    t.end();
  });
});

test('should have a createUUID function', (t) => {
  t.is(typeof app.createUUID, 'function');
});

test('should return a uuid when called', (t) => {
  const regex = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

  t.true(regex.test(app.createUUID()));
});

test('should not return the same uuid when called multiple times', (t) => {
  t.not(app.createUUID(), app.createUUID());
});
