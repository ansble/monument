/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , publicKeyPinning = require('./publicKeyPinning')
      , res = {}
      , config = {};

describe('Security Headers: Public-Key-Pin/Public-Key-Pin-Report-Only Tests', () => {
  beforeEach(() => {
    res.headers = {};

    res.setHeader = function (key, value) {
      this.headers[key] = value;
    };

    config.security = {};
  });

  it('should return a function', () => {
    assert.isFunction(publicKeyPinning);
  });

  it('should not set a header if there is no option to in config', () => {
    publicKeyPinning(config, res, true);

    assert.isUndefined(res.headers['Public-Key-Pin']);
    assert.isUndefined(res.headers['Public-Key-Pin-Report-Only']);
  });

  it('should throw if empty config is passed in', () => {
    config.security.publicKeyPin = {};
    assert.throws(() => {
      publicKeyPinning(config, res);
    });

    config.security.publicKeyPin = {
      sha256s: []
    };
    assert.throws(() => {
      publicKeyPinning(config, res);
    });

    config.security.publicKeyPin = {
      sha256s: [ 'keynumberone' ]
    };
    assert.throws(() => {
      publicKeyPinning(config, res);
    });

    config.security.publicKeyPin = {
      sha256s: [ 'keynumberone', 'keynumbertwo' ]
    };
    assert.throws(() => {
      publicKeyPinning(config, res);
    });

    config.security.publicKeyPin = {
      sha256s: [ 'keynumberone', 'keynumbertwo' ]
      , maxAge: 0
    };
    assert.throws(() => {
      publicKeyPinning(config, res);
    });
  });

  it('should return a header if correct config passed in', () => {
    const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo"; max-age=100';

    config.security.publicKeyPin = {
      sha256s: [ 'keynumberone', 'keynumbertwo' ]
      , maxAge: 100
    };

    publicKeyPinning(config, res, true);

    assert.strictEqual(res.headers['Public-Key-Pins'], expected);
  });

  it('should return a header if correct config + includeSubdomains passed in', () => {
    const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo";'
                        + ' max-age=100; includeSubdomains';

    config.security.publicKeyPin = {
      sha256s: [ 'keynumberone', 'keynumbertwo' ]
      , maxAge: 100
      , includeSubdomains: true
    };

    publicKeyPinning(config, res, true);

    assert.strictEqual(res.headers['Public-Key-Pins'], expected);
  });

  it('should return a header if correct config + includeSubdomains = false passed in', () => {
    const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo"; max-age=100';

    config.security.publicKeyPin = {
      sha256s: [ 'keynumberone', 'keynumbertwo' ]
      , maxAge: 100
      , includeSubdomains: false
    };

    publicKeyPinning(config, res, true);

    assert.strictEqual(res.headers['Public-Key-Pins'], expected);
  });

  it('should return a header if correct config + reportUri passed in', () => {
    const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo";'
                        + ' max-age=100; report-uri="http://ansble.com"';

    config.security.publicKeyPin = {
      sha256s: [ 'keynumberone', 'keynumbertwo' ]
      , maxAge: 100
      , reportUri: 'http://ansble.com'
    };

    publicKeyPinning(config, res, true);

    assert.isUndefined(res.headers['Public-Key-Pins']);
    assert.strictEqual(res.headers['Public-Key-Pins-Report-Only'], expected);
  });

  it('should return a header if correct config + reportUri and reportOnly is passed in', () => {
    const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo"; '
                        + 'max-age=100; report-uri="http://ansble.com"';

    config.security.publicKeyPin = {
      sha256s: [ 'keynumberone', 'keynumbertwo' ]
      , maxAge: 100
      , reportUri: 'http://ansble.com'
      , reportOnly: false
    };

    publicKeyPinning(config, res, true);

    assert.isUndefined(res.headers['Public-Key-Pins-Report-Only']);
    assert.strictEqual(res.headers['Public-Key-Pins'], expected);
  });

  it('should return a header if correct config + reportUri = false passed in', () => {
    const expected = 'pin-sha256="keynumberone"; pin-sha256="keynumbertwo"; max-age=100';

    config.security.publicKeyPin = {
      sha256s: [ 'keynumberone', 'keynumbertwo' ]
      , maxAge: 100
      , reportUri: false
    };

    publicKeyPinning(config, res, true);

    assert.isUndefined(res.headers['Public-Key-Pins-Report-Only']);
    assert.strictEqual(res.headers['Public-Key-Pins'], expected);
  });

  it('should return res when executed', () => {
    assert.strictEqual(res, publicKeyPinning(config, res));
  });
});
