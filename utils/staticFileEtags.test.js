/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , events = require('harken');

let etagTest;

require('./staticFileEtags');

describe('Static File Etags', () => {

  it('should be able to add a file\'s etag and return it through events', (done) => {
    events.once('etag:get:./test_stubs/routes_stub.json', (etag) => {
      etagTest = etag;
      assert.isString(etag);
      done();
    });

    events.emit('etag:add', './test_stubs/routes_stub.json');
  });

  it('should be able to check a file\'s etag and say if it is valid', (done) => {
    events.once('etag:check:./test_stubs/routes_stub.json', (valid) => {
      assert.ok(valid);
      done();
    });

    events.emit('etag:check', { file: './test_stubs/routes_stub.json', etag: etagTest });
  });

  it('should be able to udpate a file\'s etag', (done) => {
    events.once('etag:get:./test_stubs/routes_stub.json', (etag) => {
      assert.ok(etag);
      done();
    });

    events.emit('etag:check', { file: './test_stubs/routes_stub.json', etag: etagTest });
  });

  it('should raise an error if the file is not there', (done) => {
    events.once('error', (stuff) => {
      assert.strictEqual(stuff.file, './test_stubs/daniel.json');
      assert.strictEqual(stuff.message, 'could not read file');
      assert.isDefined(stuff.error);

      done();
    });

    events.emit('etag:add', './test_stubs/daniel.json');
  });
});
