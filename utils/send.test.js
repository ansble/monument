/* eslint-env node, mocha */
'use strict';

const test = require('ava')
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

test.beforeEach(() => {
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

test('should be defined as a function', (t) => {
  t.is(typeof send, 'function');
});

test('should return a function', (t) => {
  t.is(typeof send({}, {}), 'function');
});

test('should handle an empty data object', (t) => {
  fakeRes.send();
  t.is(fakeOut, '');
});

test('should handle a string', (t) => {
  fakeRes.send('The Walrus is Paul');
  t.is(fakeOut, 'The Walrus is Paul');
});

test('should handle an object', (t) => {
  fakeRes.send(obj);
  t.is(fakeOut, JSON.stringify(obj));
});

test('should handle a buffer', (t) => {
  fakeRes.send(buf);
  t.is(fakeOut, 'this is a buffer');
});

test('should handle an array', (t) => {
  fakeRes.send([ 'one', 'two' ]);
  t.is(fakeOut, JSON.stringify([ 'one', 'two' ]));
});

test('should handle a number and other weird data', (t) => {
  fakeRes.send(1);
  t.is(fakeOut, '1');
});

test('should handle a bool', (t) => {
  fakeRes.send(true);
  t.is(fakeOut, JSON.stringify(true));
});

test.cb('should return deflate compressed results if deflate header is sent', (t) => {
  fakeRes.sendDeflate(obj);

  setTimeout(() => {
    const outString = JSON.stringify(fakeOut)
          , compareString = JSON.stringify(zlib.deflateSync(JSON.stringify(obj)));

    t.is(outString, compareString);
    t.is(fakeHeaders['Content-Encoding'], 'deflate');
    t.end();
  }, compressTimeout);
});

test.cb('should return gzip compressed results if gzip header is sent', (t) => {
  fakeRes.sendGzip(obj);

  setTimeout(() => {
    const outString = JSON.stringify(fakeOut)
          , compareString = JSON.stringify(zlib.gzipSync(JSON.stringify(obj)));

    t.is(outString, compareString);
    t.is(fakeHeaders['Content-Encoding'], 'gzip');
    t.end();
  }, compressTimeout);
});

test.cb('should return brotli compressed results if brotli header is sent', (t) => {
  fakeRes.sendBrotli(obj);

  setTimeout(() => {
    const outString = JSON.stringify(fakeOut);

    brotli.compress(new Buffer(JSON.stringify(obj)), (err, compareString) => {
      t.is(outString, JSON.stringify(compareString));
      t.is(fakeHeaders['Content-Encoding'], 'br');
      t.end();
    });
  }, compressTimeout);
});

test('should return a 304 if the content has not changed', (t) => {
  const notModifiedStatus = 304;

  fakeRes.sendEtag(obj);
  t.is(fakeRes.statusCode, notModifiedStatus);
});
