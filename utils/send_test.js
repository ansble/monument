/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , send = require('./send')
      , zlib = require('zlib')
      , brotli = require('iltorb')
      , etag = require('etag')

      , compressTimeout = 10;

let fakeRes
    , fakeOut
    , fakeHeaders
    , obj
    , buf;

describe('Send Tests', () => {
  beforeEach(() => {
    fakeHeaders = {};

    fakeRes = {
      setHeader: (key, value) => {
        fakeHeaders[key] = value;
      }
      , end: (data) => {

        fakeOut = data;
      }
      , send: (data) => {

        fakeOut = data;
      }
      , statusCode: 200
    };

    fakeRes.send = send({
      headers: {
        'accept-encoding': 'none'
        , 'if-none-match': ''
      }
    }, { compression: false });

    fakeRes.sendDeflate = send({
      headers: {
        'accept-encoding': 'deflate'
        , 'if-none-match': ''
      }
    }, { compression: 'deflate' });

    fakeRes.sendGzip = send({
      headers: {
        'accept-encoding': 'gzip'
        , 'if-none-match': ''
      }
    }, { compression: 'gzip' });

    fakeRes.sendBrotli = send({
      headers: {
        'accept-encoding': 'br'
        , 'if-none-match': ''
      }
    }, { compression: 'br' });

    fakeOut = '';

    obj = {
      title: 'Tom Sawyer'
      , Author: 'Samuel Langhorne Clemens'
    };

    buf = new Buffer('this is a buffer', 'utf8');

    fakeRes.sendEtag = send({
      headers: {
        'accept-encoding': 'none'
        , 'if-none-match': etag(JSON.stringify(obj))
      }
    }, { compression: false });
  });

  it('should be defined as a function', () => {
    assert.isFunction(send);
  });

  it('should return a function', () => {
    assert.isFunction(send({}, {}));
  });

  it('should handle an empty data object', () => {
    fakeRes.send();
    assert.strictEqual(fakeOut, '');
  });

  it('should handle a string', () => {
    fakeRes.send('The Walrus is Paul');
    assert.strictEqual(fakeOut, 'The Walrus is Paul');
  });

  it('should handle an object', () => {
    fakeRes.send(obj);
    assert.strictEqual(fakeOut, JSON.stringify(obj));
  });

  it('should handle a buffer', () => {
    fakeRes.send(buf);
    assert.strictEqual(fakeOut, 'this is a buffer');
  });

  it('should handle an array', () => {
    fakeRes.send([ 'one', 'two' ]);
    assert.strictEqual(fakeOut, JSON.stringify([ 'one', 'two' ]));
  });

  it('should handle a number and other weird data', () => {
    fakeRes.send(1);
    assert.strictEqual(fakeOut, '1');
  });

  it('should handle a bool', () => {
    fakeRes.send(true);
    assert.strictEqual(fakeOut, JSON.stringify(true));
  });

  it('should return deflate compressed results if deflate header is sent', (done) => {
    fakeRes.sendDeflate(obj);

    setTimeout(() => {
      const outString = JSON.stringify(fakeOut)
            , compareString = JSON.stringify(zlib.deflateSync(JSON.stringify(obj)));

      assert.strictEqual(outString, compareString);
      assert.strictEqual(fakeHeaders['Content-Encoding'], 'deflate');
      done();
    }, compressTimeout);
  });

  it('should return gzip compressed results if gzip header is sent', (done) => {
    fakeRes.sendGzip(obj);

    setTimeout(() => {
      const outString = JSON.stringify(fakeOut)
            , compareString = JSON.stringify(zlib.gzipSync(JSON.stringify(obj)));

      assert.strictEqual(outString, compareString);
      assert.strictEqual(fakeHeaders['Content-Encoding'], 'gzip');
      done();
    }, compressTimeout);
  });

  it('should return brotli compressed results if brotli header is sent', (done) => {
    fakeRes.sendBrotli(obj);

    setTimeout(() => {
      const outString = JSON.stringify(fakeOut);

      brotli.compress(new Buffer(JSON.stringify(obj)), (err, compareString) => {
        assert.strictEqual(outString, JSON.stringify(compareString));
        assert.strictEqual(fakeHeaders['Content-Encoding'], 'br');
        done();
      });
    }, compressTimeout);
  });

  it('should return a 304 if the content has not changed', () => {
    const notModifiedStatus = 304;

    fakeRes.sendEtag(obj);
    assert.strictEqual(fakeRes.statusCode, notModifiedStatus);
  });
});
