var assert = require('chai').assert
    , events = require('../emitter')
    , etagTest;

require('./staticFileEtags');

describe('Static File Etags', function () {
  'use strict';

  it('should be able to add a file\'s etag and return it through events', function (done) {
    events.once('etag:get:./test_stubs/routes_stub.json', function (etag) {
        etagTest = etag;
        assert.isString(etag);
        done();
    });

    events.emit('etag:add', './test_stubs/routes_stub.json');
  });

  it('should be able to check a file\'s etag and say if it is valid', function (done) {
    events.once('etag:check:./test_stubs/routes_stub.json', function (valid) {
        assert.ok(valid);
        done();
    });

    events.emit('etag:check', {file: './test_stubs/routes_stub.json', etag: etagTest});
  });

  it('should be able to udpate a file\'s etag', function (done) {
    events.once('etag:get:./test_stubs/routes_stub.json', function (etag) {
        assert.ok(etag);
        done();
    });

    events.emit('etag:check', {file: './test_stubs/routes_stub.json', etag: etagTest});
  });
});
