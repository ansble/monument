'use strict';

const test = require('ava')
      , handlers = require('./contentSecurityPolicyBrowserHandlers');

test('returns a function', (t) => {
  t.is(typeof handlers, 'object');
  t.is(Object.keys(handlers).length, 8);
});

test('default handler should return all the header names', (t) => {
  const result = handlers.default();

  t.is(result.headers.length, 3);
  t.deepEqual(result.headers, [
    'X-Content-Security-Policy'
    , 'Content-Security-Policy'
    , 'X-WebKit-CSP'
  ]);
});

test('returns the correct header for IE < 12', (t) => {
  const browser = 'IE';

  t.deepEqual(handlers[browser]({ version: 9 }).headers, [ 'X-Content-Security-Policy' ]);
  t.deepEqual(handlers[browser]({ version: 6 }).headers, [ 'X-Content-Security-Policy' ]);
  t.deepEqual(handlers[browser]({ version: 8 }).headers, [ 'X-Content-Security-Policy' ]);
  t.deepEqual(handlers[browser]({ version: 10 }).headers, [ 'X-Content-Security-Policy' ]);
  t.deepEqual(handlers[browser]({ version: 11 }).headers, [ 'X-Content-Security-Policy' ]);
});

test('returns the correct header for IE >= 12', (t) => {
  const browser = 'IE';

  t.deepEqual(handlers[browser]({ version: 12 }).headers, [ 'Content-Security-Policy' ]);
  t.deepEqual(handlers[browser]({ version: 13 }).headers, [ 'Content-Security-Policy' ]);
  t.deepEqual(handlers[browser]({ version: 14 }).headers, [ 'Content-Security-Policy' ]);
});

test('returns the correct header for Chrome < 14', (t) => {
  const browser = 'Chrome';

  for (let i = 1; i < 13; i++) {
    t.deepEqual(handlers[browser]({ version: i }).headers, []);
  }
});

test('returns the correct header for Chrome >= 14 and < 25', (t) => {
  const browser = 'Chrome';

  for (let i = 14; i < 25; i++) {
    t.deepEqual(handlers[browser]({ version: i }).headers, [ 'X-WebKit-CSP' ]);
  }
});

test('returns the correct header for Chrome >= 25', (t) => {
  const browser = 'Chrome';

  for (let i = 25; i < 70; i++) {
    t.deepEqual(handlers[browser]({ version: i }).headers, [ 'Content-Security-Policy' ]);
  }
});

test('returns the correct header for Safari >= 7', (t) => {
  const browser = 'Safari';

  for (let i = 7; i < 70; i++) {
    t.deepEqual(handlers[browser]({ version: i }).headers, [ 'Content-Security-Policy' ]);
  }
});

test('returns the correct header for Safari = 6 or options.safari5', (t) => {
  const handler = handlers.Safari;

  t.deepEqual(handler({ version: 6 }, [], { safari5: false }).headers, [ 'X-WebKit-CSP' ]);
  t.deepEqual(handler({ version: 5 }, [], { safari5: true }).headers, [ 'X-WebKit-CSP' ]);
  t.deepEqual(handler({ version: 4 }, [], { safari5: true }).headers, [ 'X-WebKit-CSP' ]);
});

test('returns the correct header for Safari < 6', (t) => {
  const browser = 'Safari';

  for (let i = 1; i < 6; i++) {
    t.deepEqual(handlers[browser]({ version: i }, [], {}).headers, []);
  }
});

test('returns correct header for Opera >= 15', (t) => {
  const browser = 'Opera';

  for (let i = 15; i < 70; i++) {
    t.deepEqual(handlers[browser]({ version: i }).headers, [ 'Content-Security-Policy' ]);
  }
});

test('returns correct header for Opera < 15', (t) => {
  const browser = 'Opera';

  for (let i = 1; i < 15; i++) {
    t.deepEqual(handlers[browser]({ version: i }).headers, []);
  }
});

test('returns correct header for Android Browser < 4.4', (t) => {
  const browser = 'Android Browser';

  for (let i = 1; i < 4.4; i = i + 0.1) {
    t.deepEqual(handlers[browser]({ os: { version: i.toPrecision(2) } }).headers, []);
  }
});

test('returns correct header for Android Browser >= 4.4', (t) => {
  const handler = handlers['Android Browser']
        , expected = [ 'Content-Security-Policy' ];

  for (let i = 4.4; i < 12; i = i + 0.1) {
    t.deepEqual(handler({ os: { version: i.toPrecision(2) } }, [], {}).headers, expected);
  }
});

test('returns correct header for Android Browser >= 4.4 and disabledAndroid', (t) => {
  const handler = handlers['Android Browser']
        , expected = [ 'Content-Security-Policy' ];

  for (let i = 4.4; i < 12; i = i + 0.1) {
    const version = { version: i.toPrecision(2) };

    t.deepEqual(handler({ os: version }, [], { disabledAndroid: true }).headers, expected);
  }
});

test('returns correct header for Chrome Mobile Browser >= 4.4', (t) => {
  const handler = handlers['Chrome Mobile']
        , expected = [ 'Content-Security-Policy' ];

  for (let i = 4.4; i < 30; i = i + 0.1) {
    const version = { version: i.toPrecision(2) };

    t.deepEqual(handler({ os: version }, [], { disabledAndroid: true }).headers, expected);
  }
});

test('returns correct header for Chrome Mobile < 4.4', (t) => {
  const browser = 'Chrome Mobile';

  for (let i = 1; i < 4.4; i = i + 0.1) {
    t.deepEqual(handlers[browser]({ os: { version: i.toPrecision(2) } }).headers, []);
  }
});

test('returns correct header for Chrome Mobile >= 4.4', (t) => {
  const browser = 'Chrome Mobile';

  for (let i = 4.4; i < 12; i = i + 0.1) {
    const version = { version: i.toPrecision(2) };

    t.deepEqual(handlers[browser]({ os: version }, {}).headers, [ 'Content-Security-Policy' ]);
  }
});

test('returns correct headers for Chrome Mobile >= 4.4 and iOS', (t) => {
  const browser = 'Chrome Mobile';

  for (let i = 4.4; i < 12; i = i + 0.1) {
    const os = { family: 'iOS', version: i.toPrecision(2) };

    t.deepEqual(handlers[browser]({ os: os }, {}).headers, [ 'Content-Security-Policy' ]);
    t.deepEqual(handlers[browser]({ os: os }, {}).directives.connectSrc, [ "'self'" ]);
  }
});

test('returns correct headers for Chrome Mobile >= 4.4 and iOS and connectSrc directive', (t) => {
  const browser = 'Chrome Mobile';

  for (let i = 4.4; i < 12; i = i + 0.1) {
    const os = { family: 'iOS', version: i.toPrecision(2) }
          , connect = { connectSrc: [ 'test' ] };

    t.deepEqual(handlers[browser]({ os: os }, connect).headers, [ 'Content-Security-Policy' ]);
    t.deepEqual(handlers[browser]({ os: os }, connect).directives.connectSrc, [ 'test', "'self'" ]);
  }
});

test('returns correct headers for Firefox < 4', (t) => {
  const browser = 'Firefox';

  for (let i = 1; i < 4; i++) {
    t.deepEqual(handlers[browser]({ version: i }, {}).headers, []);
  }
});

test('returns correct headers for Firefox >= 23', (t) => {
  const browser = 'Firefox';

  for (let i = 23; i < 70; i++) {
    t.deepEqual(handlers[browser]({ version: i }, {}).headers, [ 'Content-Security-Policy' ]);
  }
});

test('returns correct headers for Firefox = 4', (t) => {
  const browser = 'Firefox';

  t.deepEqual(handlers[browser]({ version: 4 }, {}).headers, [ 'X-Content-Security-Policy' ]);
  t.deepEqual(handlers[browser]({ version: 4 }, {}).directives.defaultSrc, [ '*' ]);
  t.deepEqual(handlers[browser]({ version: 4 }, {}).directives.allow, [ '*' ]);
  t.is(Object.keys(handlers[browser]({ version: 4 }, {}).directives).length, 2);
});

test('returns correct headers for Firefox >= 5 and < 23', (t) => {
  const browser = 'Firefox';

  for (let i = 5; i < 23; i++) {
    const version = { version: i };

    t.deepEqual(handlers[browser](version, {}).headers, [ 'X-Content-Security-Policy' ]);
    t.deepEqual(handlers[browser](version, {}).directives.defaultSrc, [ '*' ]);
    t.is(Object.keys(handlers[browser](version, {}).directives).length, 1);
    t.deepEqual(handlers[browser](version, { test: [ 'test' ] }).directives.test, [ 'test' ]);
    t.is(Object.keys(handlers[browser](version, { test: [ 'test' ] }).directives).length, 2);
  }
});

test('returns correct headers for Firefox >= 5 and < 23 and connectSrc', (t) => {
  const handler = handlers.Firefox
        , connect = { connectSrc: [ 'test' ], test: [ 'test' ] };

  for (let i = 5; i < 23; i++) {
    t.deepEqual(handler({ version: i }, connect).headers, [ 'X-Content-Security-Policy' ]);
    t.deepEqual(handler({ version: i }, connect).directives.defaultSrc, [ '*' ]);
    t.deepEqual(handler({ version: i }, connect).directives.connectSrc, [ 'test' ]);
    t.deepEqual(handler({ version: i }, connect).directives.xhrSrc, [ 'test' ]);
    t.deepEqual(handler({ version: i }, connect).directives.test, [ 'test' ]);
    t.is(Object.keys(handler({ version: i }, connect).directives).length, 4);
  }
});

test('returns correct headers for Firefox >= 5 and < 23 and unsafe-inline for scriptSrc', (t) => {
  const handler = handlers.Firefox
        , options = { scriptSrc: [ "'unsafe-inline'" ] };

  for (let i = 5; i < 23; i++) {
    t.deepEqual(handler({ version: i }, options).headers, [ 'X-Content-Security-Policy' ]);
    t.deepEqual(handler({ version: i }, options).directives.defaultSrc, [ '*' ]);
    t.deepEqual(handler({ version: i }, options).directives.scriptSrc, [ "'inline-script'" ]);
    t.is(Object.keys(handler({ version: i }, options).directives).length, 2);
  }
});

test('returns correct headers for Firefox >= 5 and < 23 and unsafe-eval for scriptSrc', (t) => {
  const handler = handlers.Firefox
        , options = { scriptSrc: [ "'unsafe-eval'" ] };

  for (let i = 5; i < 23; i++) {
    t.deepEqual(handler({ version: i }, options).headers, [ 'X-Content-Security-Policy' ]);
    t.deepEqual(handler({ version: i }, options).directives.defaultSrc, [ '*' ]);
    t.deepEqual(handler({ version: i }, options).directives.scriptSrc, [ "'eval-script'" ]);
    t.is(Object.keys(handler({ version: i }, options).directives).length, 2);
  }
});

test('returns correct headers for Firefox >= 5 and < 23 and unsafe-inline', (t) => {
  const handler = handlers.Firefox
        , options = { test: [ "'unsafe-inline'" ] };

  for (let i = 5; i < 23; i++) {
    t.deepEqual(handler({ version: i }, options).headers, [ 'X-Content-Security-Policy' ]);
    t.deepEqual(handler({ version: i }, options).directives.defaultSrc, [ '*' ]);
    t.deepEqual(handler({ version: i }, options).directives.test, []);
    t.is(Object.keys(handler({ version: i }, options).directives).length, 2);
  }
});

test('returns correct headers for Firefox >= 5 and < 23 and unsafe-eval', (t) => {
  const handler = handlers.Firefox
        , options = { test: [ "'unsafe-eval'" ] };

  for (let i = 5; i < 23; i++) {
    t.deepEqual(handler({ version: i }, options).headers, [ 'X-Content-Security-Policy' ]);
    t.deepEqual(handler({ version: i }, options).directives.defaultSrc, [ '*' ]);
    t.deepEqual(handler({ version: i }, options).directives.test, []);
    t.is(Object.keys(handler({ version: i }, options).directives).length, 2);
  }
});
