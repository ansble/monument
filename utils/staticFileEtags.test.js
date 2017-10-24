/* eslint-env node, mocha */
'use strict';

const test = require('ava')
      , events = require('harken');

let etagTest;

require('./staticFileEtags');

test.cb('should be able to add a file\'s etag and return it through events', (t) => {
  events.once('etag:get:./test_stubs/routes_stub.json', (etag) => {
    etagTest = etag;
    t.is(typeof etag, 'string');
    t.end();
  });

  events.emit('etag:add', './test_stubs/routes_stub.json');
});

test.cb('should be able to check a file\'s etag and say if it is valid', (t) => {
  events.once('etag:check:./test_stubs/routes_stub.json', (valid) => {
    t.truthy(valid);
    t.end();
  });

  events.emit('etag:check', { file: './test_stubs/routes_stub.json', etag: etagTest });
});

test.cb('should be able to udpate a file\'s etag', (t) => {
  events.once('etag:get:./test_stubs/routes_stub.json', (etag) => {
    t.truthy(etag);
    t.end();
  });

  events.emit('etag:check', { file: './test_stubs/routes_stub.json', etag: etagTest });
});

test.cb('should raise an error if the file is not there', (t) => {
  events.once('error', (stuff) => {
    t.is(stuff.file, './test_stubs/daniel.json');
    t.is(stuff.message, 'could not read file');
    t.not(typeof stuff.error, 'undefined');

    t.end();
  });

  events.emit('etag:add', './test_stubs/daniel.json');
});
