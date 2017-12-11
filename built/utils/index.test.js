

const test = require('ava'),
      utils = require('./index');

test('should return an object that has a send and getCompression functions', t => {
  t.is(typeof utils.send, 'function');
  t.is(typeof utils.getCompression, 'function');
  t.is(typeof utils.setup, 'function');
  t.is(typeof utils.parsePath, 'function');
  t.is(typeof utils.isDefined, 'function');
  t.is(typeof utils.isUndefined, 'function');
  t.is(typeof utils.not, 'function');
  t.is(typeof utils.redirect, 'function');
  t.is(typeof utils.contains, 'function');
});

test('getCompression tests::should return deflate if the deflate header is passed in', t => {
  t.is(utils.getCompression('deflate', { compress: true }), 'deflate');
});

test('getCompression tests::should return gzip if gzip is in the header passed in', t => {
  t.is(utils.getCompression('gzip', { compress: true }), 'gzip');
});

test('getCompression tests::should return br if brotli is in the header passed in', t => {
  t.is(utils.getCompression('br', { compress: true }), 'br');
});

test('getCompression tests::should return gzip if both gzip and deflate are in the header', t => {
  t.is(utils.getCompression('deflate gzip', { compress: true }), 'gzip');
});

test('getCompression tests::should return brotli if brotli, gzip and deflate are in the header', t => {
  t.is(utils.getCompression('deflate gzip br', { compress: true }), 'br');
});

test('getCompression tests::should return none if no header is passed in', t => {
  let header;

  t.is(utils.getCompression(header, { compress: true }), 'none');
});

test('getCompression tests::should return none if an empty header is passed in', t => {
  t.is(utils.getCompression('', { compress: true }), 'none');
});

test('getCompression tests::should return none if compression is turned off no matter what the header is', t => {
  t.is(utils.getCompression('gzip', { compress: false }), 'none');
});

test('getCompression tests::should return correct compression if compression is not in the config', t => {
  t.is(utils.getCompression('gzip', {}), 'gzip');
});

test('send tests::should have a send function', t => {
  t.is(typeof utils.send, 'function');
});

test('setup tests::utils should have a setup function', t => {
  t.is(typeof utils.setup, 'function');
});

test('setup tests::utils should log info about statsd', t => {
  let logMessage;
  const config = {
    log: {
      info: msg => {
        logMessage = msg;
      }
    },
    statsd: {
      host: 'test',
      port: '8080'
    }
  };

  utils.setup(config);
  t.truthy(logMessage.match(config.statsd.host));
  t.truthy(logMessage.match(config.statsd.port));
});