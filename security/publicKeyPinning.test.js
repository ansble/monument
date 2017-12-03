'use strict';

const test = require('ava')
      , publicKeyPinning = require('./publicKeyPinning')
      , res = {}
      , config = {};

test.beforeEach(() => {
  res.headers = {};

  res.setHeader = function (key, value) {
    this.headers[key] = value;
  };

  config.security = {};
});

test('should return a function', (t) => {
  t.is(typeof publicKeyPinning, 'function');
});

test('should not set a header if there is no option to in config', (t) => {
  publicKeyPinning(config, res, true);

  t.is(typeof res.headers['Public-Key-Pin'], 'undefined');
  t.is(typeof res.headers['Public-Key-Pin-Report-Only'], 'undefined');
});

test('should throw if empty config is passed in', (t) => {
  config.security.publicKeyPin = {};
  t.throws(() => {
    publicKeyPinning(config, res);
  });

  config.security.publicKeyPin = {
    sha256s: []
  };
  t.throws(() => {
    publicKeyPinning(config, res);
  });

  config.security.publicKeyPin = {
    sha256s: [ 'keynumberone' ]
  };
  t.throws(() => {
    publicKeyPinning(config, res);
  });

  config.security.publicKeyPin = {
    sha256s: [ 'keynumberone', 'keynumbertwo' ]
  };
  t.throws(() => {
    publicKeyPinning(config, res);
  });

  config.security.publicKeyPin = {
    sha256s: [ 'keynumberone', 'keynumbertwo' ]
    , maxAge: 0
  };
  t.throws(() => {
    publicKeyPinning(config, res);
  });
});

test('should return a header if correct config passed in', (t) => {
  const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo"; max-age=100';

  config.security.publicKeyPin = {
    sha256s: [ 'keynumberone', 'keynumbertwo' ]
    , maxAge: 100
  };

  publicKeyPinning(config, res, true);

  t.is(res.headers['Public-Key-Pins'], expected);
});

test('should return a header if correct config + includeSubdomains passed in', (t) => {
  const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo";'
                      + ' max-age=100; includeSubdomains';

  config.security.publicKeyPin = {
    sha256s: [ 'keynumberone', 'keynumbertwo' ]
    , maxAge: 100
    , includeSubdomains: true
  };

  publicKeyPinning(config, res, true);

  t.is(res.headers['Public-Key-Pins'], expected);
});

test('should return a header if correct config + includeSubdomains = false passed in', (t) => {
  const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo"; max-age=100';

  config.security.publicKeyPin = {
    sha256s: [ 'keynumberone', 'keynumbertwo' ]
    , maxAge: 100
    , includeSubdomains: false
  };

  publicKeyPinning(config, res, true);

  t.is(res.headers['Public-Key-Pins'], expected);
});

test('should return a header if correct config + reportUri passed in', (t) => {
  const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo";'
                      + ' max-age=100; report-uri="http://ansble.com"';

  config.security.publicKeyPin = {
    sha256s: [ 'keynumberone', 'keynumbertwo' ]
    , maxAge: 100
    , reportUri: 'http://ansble.com'
  };

  publicKeyPinning(config, res, true);

  t.is(typeof res.headers['Public-Key-Pins'], 'undefined');
  t.is(res.headers['Public-Key-Pins-Report-Only'], expected);
});

test('should return a header if correct config + reportUri and reportOnly is passed in', (t) => {
  const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo"; '
                      + 'max-age=100; report-uri="http://ansble.com"';

  config.security.publicKeyPin = {
    sha256s: [ 'keynumberone', 'keynumbertwo' ]
    , maxAge: 100
    , reportUri: 'http://ansble.com'
    , reportOnly: false
  };

  publicKeyPinning(config, res, true);

  t.is(typeof res.headers['Public-Key-Pins-Report-Only'], 'undefined');
  t.is(res.headers['Public-Key-Pins'], expected);
});

test('should return a header if correct config + reportUri = false passed in', (t) => {
  const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo"; max-age=100';

  config.security.publicKeyPin = {
    sha256s: [ 'keynumberone', 'keynumbertwo' ]
    , maxAge: 100
    , reportUri: false
  };

  publicKeyPinning(config, res, true);

  t.is(typeof res.headers['Public-Key-Pins-Report-Only'], 'undefined');
  t.is(res.headers['Public-Key-Pins'], expected);
});

test('should return res when executed', (t) => {
  t.is(res, publicKeyPinning(config, res));
});
