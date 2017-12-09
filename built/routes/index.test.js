

const test = require('ava'),
      server = require('./index');

test('Routing Tests::should return a function that starts a server', t => {
  t.is(typeof server.server, 'function');
});

test('Routing Tests::should have a parseWildCardRoute function', t => {
  t.is(typeof server.parseWildCardRoute, 'function');
});

test('Routing Tests::should have a isWildCardRoute function', t => {
  t.is(typeof server.isWildCardRoute, 'function');
});