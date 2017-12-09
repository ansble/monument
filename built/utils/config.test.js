

const test = require('ava'),
      config = require('./config'),
      path = require('path');

test.beforeEach(() => {
  config.reset();
});

test.afterEach(() => {
  config.reset();
});

test('should return an object', t => {
  t.is(typeof config.set, 'function');
  t.is(typeof config.get, 'function');
  t.is(typeof config.reset, 'function');
});

test('should set smart defaults', t => {
  const configObj = config.get();

  t.is(configObj.port, 3000);
  t.is(typeof configObj.server, 'object');
  t.is(configObj.routePath, path.join(process.cwd(), './routes.json'));
  t.is(config.routesJSONPath, config.routePath);
  t.is(configObj.publicPath, path.join(process.cwd(), './public'));
  t.is(configObj.compress, true);
  t.is(configObj.webSockets, false);
  t.is(configObj.templatePath, path.join(process.cwd(), './templates'));
  t.is(configObj.maxAge, 31536000);
  t.is(configObj.etags, true);
  t.is(typeof configObj.security, 'object');
  t.is(configObj.security.xssProtection, true);
  t.is(configObj.security.poweredBy, undefined);
  t.is(configObj.security.noSniff, true);
  t.is(configObj.security.noCache, false);
  t.is(typeof configObj.security.framegaurd, 'object');
  t.is(configObj.security.framegaurd.action, 'SAMEORIGIN');
  t.is(typeof configObj.security.hsts, 'object');
  t.is(configObj.security.hsts.maxAge, 86400);
  t.is(typeof configObj.log, 'object');
  t.is(typeof configObj.log.info, 'function');
  t.is(typeof configObj.log.debug, 'function');
  t.is(typeof configObj.log.warn, 'function');
  t.is(typeof configObj.log.error, 'function');
  t.is(typeof configObj.log.trace, 'function');
});

test('.get tests::should return the whole config option when called with no value', t => {
  const configObj = config.get();

  t.is(typeof configObj, 'object');
});

test('.get tests::should return the value if a key is passed in', t => {
  const value = config.get('port');

  t.is(typeof value, 'number');
});

test('.set tests::should accept an object of settings', t => {
  config.set({
    port: 1234,
    routePath: '/etc/bin'
  });

  t.is(config.get('port'), 1234);
  t.is(config.get('routePath'), path.join(process.cwd(), '/etc/bin'));
});

test('.set tests::should accept a key value pair of a setting', t => {
  config.set('port', 1212);

  t.is(config.get('port'), 1212);
});

test('.set tests::should return the configObject after setting', t => {
  const testObj = config.set('port', 1211);

  t.is(typeof testObj, 'object');
  t.is(testObj.port, 1211);
});

test('.set tests::should merge defaults in objects', t => {
  config.set({
    port: 1234,
    routePath: '/etc/bin',
    statsd: {
      host: 'test',
      port: '42'
    }
  });

  t.is(config.get('port'), 1234);
  t.is(config.get('routePath'), path.join(process.cwd(), '/etc/bin'));
  t.is(config.get('statsd').host, 'test');
  t.is(config.get('statsd').port, '42');
  t.is(config.get('statsd').cacheDns, true);
});

test('.set tests::should not merge defaults in objects if value is not object', t => {
  config.set({
    port: 1234,
    routePath: '/etc/bin',
    statsd: false
  });

  t.is(config.get('port'), 1234);
  t.is(config.get('routePath'), path.join(process.cwd(), '/etc/bin'));
  t.is(config.get('statsd'), false);
});