/* eslint-env node, mocha */
'use strict';

const test = require('ava')
      , routeStore = require('./routeStore');

test.afterEach(() => {
  routeStore.clear();
});

test.beforeEach(() => {
  routeStore.add('/test', [ 'get', 'post', 'put' ]);
  routeStore.add('/hobbits', [ 'get' ]);
  routeStore.add('/hobbits/:name', [ 'get' ]);
  routeStore.add('/rangers/:name', [ 'get', 'post', 'put', 'delete' ]);
});

test('should remove all if no verbs are passed', (t) => {
  t.is(typeof routeStore.remove('/test').standard['/test'], 'undefined');
  t.not(typeof routeStore.get().standard['/hobbits'], 'undefined');
  t.is(typeof routeStore.remove('/hobbits').standard['/hobbits'], 'undefined');
  t.is(typeof routeStore.remove('/hobbits/:name').wildcard['/hobbits/:name'], 'undefined');
});

test('should remove the whole route if all verbs are passed to it', (t) => {
  const allVerbs = [ 'get', 'post', 'put', 'delete' ];

  t.is(typeof routeStore.remove('/test', [ 'get', 'put', 'post' ])
    .standard['/test'], 'undefined');

  t.not(typeof routeStore.get().standard['/hobbits'], 'undefined');

  t.is(typeof routeStore.remove('/hobbits', 'get')
    .standard['/hobbits'], 'undefined');

  t.is(typeof routeStore.remove('/hobbits/:name', 'get')
    .wildcard['/hobbits/:name'], 'undefined');

  t.is(typeof routeStore.remove('/rangers/:name', allVerbs)
    .wildcard['/rangers/:name'], 'undefined');
});

test('should remove only a verb if a route listens to multiple but one is passed', (t) => {
  const routes = routeStore.remove('/test', [ 'get' ]).standard
        , wild = routeStore.remove('/rangers/:name', [ 'get', 'post' ]);

  t.true(Array.isArray(routes['/test']));
  t.is(routes['/test'].length, 2);
  t.true(Array.isArray(wild.wildcard['/rangers/:name'].verbs));
  t.is(wild.wildcard['/rangers/:name'].verbs.length, 2);
});

test('should remove only the verbs passed if a route listens to multiple', (t) => {
  const routes = routeStore.remove('/test', [ 'put', 'post' ]).standard
        , wild = routeStore.remove('/rangers/:name', [ 'put', 'post', 'delete' ]).wildcard;

  t.true(Array.isArray(routes['/test']));
  t.is(routes['/test'].length, 1);
  t.is(routes['/test'][0], 'get');
  t.true(Array.isArray(wild['/rangers/:name'].verbs));
  t.is(wild['/rangers/:name'].verbs.length, 1);
  t.is(wild['/rangers/:name'].verbs[0], 'get');
});

test('should do nothing if there is no match', (t) => {
  const routes = routeStore.remove('/sam', [ 'get' ]).standard;

  t.true(Array.isArray(routes['/test']));
  t.is(routes['/test'].length, 3);
});
