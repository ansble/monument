var assert = require('chai').assert
  , parser = require('./parser')
  , Readable = require('stream').Readable
  , stream
  , jsonBody;

describe('Parser Tests', function () {
  'use strict';

  beforeEach(function () {
    stream = new Readable();
    jsonBody = {name: 'Tomas Voekler'};
  });

  it('should return a function', function () {
    assert.isFunction(parser);
  });

  it('should parse out a form submission');

  it('should parse out a json post/put/update', function (done) {
    stream.push(JSON.stringify(jsonBody));
    stream.push(null);
    stream.headers = {
      'content-length': 24
      , 'content-type': 'application/json'
    };

    parser({req: stream}, function (body) {
      assert.isObject(body);
      done();
    }, {});

  });

  it('should place the parsed elements in body', function (done) {
    stream.push(JSON.stringify(jsonBody));
    stream.push(null);
    stream.headers = {
      'content-length': 24
      , 'content-type': 'application/json'
    };

    parser({req: stream}, function (body) {
      assert.strictEqual(JSON.stringify(body), JSON.stringify(jsonBody));
      done();
    }, {});

  });
});
