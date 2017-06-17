/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
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

describe('Parser Tests', () => {

  beforeEach(() => {
    stream = new Readable();
    jsonBody = { name: 'Tomas Voekler' };
    fileToRead = path.join(process.cwd(), '/test_stubs/formDataBody.txt');
    formDataBody = fs.createReadStream(fileToRead);
    urlBody = 'name=daniel&title=lord+of+the+actual+internet1';
    errorBody = '{name: "Tomas Voekler"';
  });

  it('should return a function', () => {
    assert.isFunction(parser);
  });

  it('should parse out a multipart/form-data submission', (done) => {
    const form = new FormData();

    form.append('cont', 'some random content');
    form.append('title', 'lord of the interwebz');

    form.headers = form.getHeaders();

    parser({ req: form }, (body, err) => {
      assert.isUndefined(err);
      assert.isObject(body);
      assert.strictEqual(body.cont, 'some random content');
      assert.strictEqual(body.title, 'lord of the interwebz');
      done();
    });
  });

  it('should parse out a application/x-www-form-urlencoded submission', (done) => {
    stream.push(urlBody);
    stream.push(null);
    stream.headers = {
      'content-length': urlBody.length
      , 'content-type': 'application/x-www-form-urlencoded'
    };

    parser({ req: stream }, (body, err) => {
      assert.isUndefined(err);
      assert.isObject(body);
      assert.strictEqual(body.name, 'daniel');
      done();
    });
  });

  it('should parse out a json post/put/update', (done) => {
    stream.push(JSON.stringify(jsonBody));
    stream.push(null);
    stream.headers = {
      'content-length': 24
      , 'content-type': 'application/json'
    };

    parser({ req: stream }, (body) => {
      assert.isObject(body);
      done();
    }, {});

  });

  it('should error on an invalid json post/put/update', (done) => {
    stream.push('{"name": "Jonah"');
    stream.push(null);
    stream.headers = {
      'content-length': '{"name": "Jonah"'.length
      , 'content-type': 'application/json'
    };

    parser({ req: stream }, (body, err) => {
      assert.isNull(body);
      assert.instanceOf(err, Error);
      done();
    }, {});
  });

  it('should error on an invalid json post/put/update and emit the error:parse event', (done) => {
    stream.push('{"name": "Jonah"');
    stream.push(null);
    stream.headers = {
      'content-length': '{"name": "Jonah"'.length
      , 'content-type': 'application/json'
    };

    parser({ req: stream }, (body, err) => {
      assert.isNull(body);
      assert.instanceOf(err, Error);
    }, {});

    events.once('error:parse', (error) => {
      assert.instanceOf(error, Error);
      done();
    });
  });

  it('should parse out a json post/put/update without the correct header', (done) => {
    stream.push(JSON.stringify(jsonBody));
    stream.push(null);
    stream.headers = {
      'content-length': 24
    };

    parser({ req: stream }, (body) => {
      assert.isObject(body);
      done();
    }, {});

  });

  it('should place the parsed elements in body', (done) => {
    stream.push(JSON.stringify(jsonBody));
    stream.push(null);
    stream.headers = {
      'content-length': 24
      , 'content-type': 'application/json'
    };

    parser({ req: stream }, (body) => {
      assert.strictEqual(JSON.stringify(body), JSON.stringify(jsonBody));
      done();
    }, {});

  });

  it('should handle parse errors correctly when they occur', (done) => {
    stream.push(errorBody);
    stream.push(null);
    stream.headers = {
      'content-length': 23
      , 'content-type': 'application/json'
    };

    events.on('error:parse', (msg) => {
      assert.isDefined(msg);
      assert.instanceOf(msg, Error);
      events.emit('error');
    });

    parser({ req: stream }, (body) => {
      assert.isNull(body);
      events.emit('parse');
    }, {});

    events.required([ 'parse', 'error' ], () => {
      done();
    });
  });

  it('should parse out uploaded files', (done) => {
    const form = new FormData();

    form.append('cont', 'some random content');
    form.append('title', 'lord of the interwebz');
    form.append('file1', formDataBody);

    form.headers = form.getHeaders();

    parser({ req: form }, (body, err) => {
      assert.isUndefined(err);
      assert.isObject(body);
      assert.strictEqual(body.cont, 'some random content');
      assert.strictEqual(body.title, 'lord of the interwebz');
      assert.isObject(body.file1);
      assert.strictEqual(body.file1.name, 'formDataBody.txt');
      assert.isDefined(body.file1.encoding);
      assert.isDefined(body.file1.tempFile);
      assert.isDefined(body.file1.mimetype);
      assert.isDefined(body.file1.file);
      assert.isTrue(fs.statSync(body.file1.tempFile).isFile());
      done();
    });
  });
});
