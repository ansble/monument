/* eslint-env node, mocha */
'use strict';

const test = require('ava')
      , parser = require('./parser')
      , Readable = require('stream').Readable
      , fs = require('fs')
      , events = require('harken')
      , path = require('path')
      , FormData = require('form-data');

let stream
    , jsonBody
    , formDataBody
    , urlBody
    , errorBody
    , fileToRead;

test.beforeEach(() => {
  stream = new Readable();
  jsonBody = { name: 'Tomas Voekler' };
  fileToRead = path.join(process.cwd(), '/test_stubs/formDataBody.txt');
  formDataBody = fs.createReadStream(fileToRead);
  urlBody = 'name=daniel&title=lord+of+the+actual+internet1';
  errorBody = '{name: "Tomas Voekler"';
});

test('should return a function', (t) => {
  t.is(typeof parser, 'function');
});

test.cb('should parse out a multipart/form-data submission', (t) => {
  const form = new FormData();

  form.append('cont', 'some random content');
  form.append('title', 'lord of the interwebz');

  form.headers = form.getHeaders();

  parser({ req: form }, (body, err) => {
    t.is(typeof err, 'undefined');
    t.is(typeof body, 'object');
    t.is(body.cont, 'some random content');
    t.is(body.title, 'lord of the interwebz');
    t.end();
  });
});

test.cb('should parse out a application/x-www-form-urlencoded submission', (t) => {
  stream.push(urlBody);
  stream.push(null);
  stream.headers = {
    'content-length': urlBody.length
    , 'content-type': 'application/x-www-form-urlencoded'
  };

  parser({ req: stream }, (body, err) => {
    t.is(typeof err, 'undefined');
    t.is(typeof body, 'object');
    t.is(body.name, 'daniel');
    t.end();
  });
});

test.cb('should parse out a json post/put/update', (t) => {
  stream.push(JSON.stringify(jsonBody));
  stream.push(null);
  stream.headers = {
    'content-length': 24
    , 'content-type': 'application/json'
  };

  parser({ req: stream }, (body) => {
    t.is(typeof body, 'object');
    t.end();
  }, {});

});

test.cb('should error on an invalid json post/put/update', (t) => {
  stream.push('{"name": "Jonah"');
  stream.push(null);
  stream.headers = {
    'content-length': '{"name": "Jonah"'.length
    , 'content-type': 'application/json'
  };

  parser({ req: stream }, (body, err) => {
    t.is(body, null);
    t.true(err instanceof Error);
    t.end();
  }, {});
});

test.cb('should error on an invalid json post/put/update and emit the error:parse event', (t) => {
  stream.push('{"name": "Jonah"');
  stream.push(null);
  stream.headers = {
    'content-length': '{"name": "Jonah"'.length
    , 'content-type': 'application/json'
  };

  parser({ req: stream }, (body, err) => {
    t.is(body, null);
    t.true(err instanceof Error);
  }, {});

  events.once('error:parse', (error) => {
    t.true(error instanceof Error);
    t.end();
  });
});

test.cb('should parse out a json post/put/update without the correct header', (t) => {
  stream.push(JSON.stringify(jsonBody));
  stream.push(null);
  stream.headers = {
    'content-length': 24
  };

  parser({ req: stream }, (body) => {
    t.is(typeof body, 'object');
    t.end();
  }, {});

});

test.cb('should place the parsed elements in body', (t) => {
  stream.push(JSON.stringify(jsonBody));
  stream.push(null);
  stream.headers = {
    'content-length': 24
    , 'content-type': 'application/json'
  };

  parser({ req: stream }, (body) => {
    t.is(JSON.stringify(body), JSON.stringify(jsonBody));
    t.end();
  }, {});

});

test.cb('should handle parse errors correctly when they occur', (t) => {
  stream.push(errorBody);
  stream.push(null);
  stream.headers = {
    'content-length': 23
    , 'content-type': 'application/json'
  };

  events.on('error:parse', (msg) => {
    t.not(typeof msg, 'undefined');
    t.true(msg instanceof Error);
    events.emit('error');
  });

  parser({ req: stream }, (body) => {
    t.is(body, null);
    events.emit('parse');
  }, {});

  events.required([ 'parse', 'error' ], () => {
    t.end();
  });
});

test.cb('should parse out uploaded files', (t) => {
  const form = new FormData();

  form.append('cont', 'some random content');
  form.append('title', 'lord of the interwebz');
  form.append('file1', formDataBody);

  form.headers = form.getHeaders();

  parser({ req: form }, (body, err) => {
    t.is(typeof err, 'undefined');
    t.is(typeof body, 'object');
    t.is(body.cont, 'some random content');
    t.is(body.title, 'lord of the interwebz');
    t.is(typeof body.file1, 'object');
    t.is(body.file1.name, 'formDataBody.txt');
    t.not(typeof body.file1.encoding, 'undefined');
    t.not(typeof body.file1.tempFile, 'undefined');
    t.not(typeof body.file1.mimetype, 'undefined');
    t.not(typeof body.file1.file, 'undefined');
    t.true(fs.statSync(body.file1.tempFile).isFile());
    t.end();
  });
});
