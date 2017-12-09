

const test = require('ava')
      , servers = []
      , events = require('harken')

      , http2 = require('http2')
      , fs = require('fs')
      , path = require('path')
      , semver = require('semver')
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

test.cb('should return an http2 server when http2 and correct params are passed in', (t) => {
  const http2App = require('./index');

  http2App.server({
    routeJSONPath: './test_stubs/routes_stub.json'
    , templatePath: './test_stubs/templates'
    , routePath: './test_stubs'
    , compress: false
    , server: http2
    , port: 9996
    , serverOptions: {
      cert: fs.readFileSync(path.join(__dirname, './test_stubs/certs/test.crt'))
      , key: fs.readFileSync(path.join(__dirname, './test_stubs/certs/tests.key'))
    }
    , log: {
      log: () => {}
    }
  });

  http2App.events.once('server:started', (settings) => {
    servers.push(settings.server);

    if (semver.lt(process.versions.node, '8.8.0')) {
      t.true(settings.server instanceof http2.Server);
    } else {
      t.is(settings.server.constructor.name, 'Http2Server');
    }

    t.end();
  });
});
