/* eslint-env node, mocha */
'use strict';

const test = require('ava')
      , redirect = require('./redirect')
      , events = require('harken')

      , defaultRedirectStatus = 307
      , status302 = 302;

let fakeRes
    , fakeOut
    , fakeHeaders
    , fakeHead;

test.beforeEach(() => {
  fakeHeaders = {};

  fakeRes = {
    setHeader: (key, value) => {
      fakeHeaders[key] = value;
    }
    , end: (data) => {
      fakeOut = data;
    }
    , statusCode: 200
  };

  fakeHead = {
    setHeader: (key, value) => {
      fakeHeaders[key] = value;
    }
    , end: (data) => {
      fakeOut = data;
    }
    , statusCode: 200
  };

  fakeRes.redirect = redirect({
    headers: {
      'accept-encoding': 'none'
      , 'if-none-match': ''
    }
  });

  fakeHead.redirect = redirect({
    headers: {
      'accept-encoding': 'none'
      , 'if-none-match': ''
    }
    , method: 'HEAD'
  });

  fakeOut = '';
});

test('should be defined as a function', (t) => {
  t.is(typeof redirect, 'function');
});

test('should return a function', (t) => {
  t.is(typeof redirect({}), 'function');
});

test.cb('should raise a 500 error event if no url is passed', (t) => {
  events.once('error:500', (msg) => {
    t.not(typeof msg, 'undefined');
    t.end();
  });

  fakeRes.redirect();
});

test('should default to 307 for just an url passed', (t) => {
  fakeRes.redirect('www.google.com');
  t.is(fakeOut, '307 Temporary Redirect to www.google.com');
  t.is(fakeHeaders.location, 'www.google.com');
  t.is(fakeRes.statusCode, defaultRedirectStatus);
});

test('should allow a statusCode to be passed in', (t) => {
  fakeRes.redirect('www.google.com', status302);
  t.is(fakeOut, '302 Found to www.google.com');
  t.is(fakeHeaders.location, 'www.google.com');
  t.is(fakeRes.statusCode, status302);
});

test('should return an empty body if \'HEAD\' request and specified type', (t) => {
  fakeHead.redirect('www.google.com', status302);
  t.is(fakeOut, undefined);
  t.is(fakeHeaders.location, 'www.google.com');
  t.is(fakeHead.statusCode, status302);
});

test('should return an empty body if \'HEAD\' request and no type', (t) => {
  fakeHead.redirect('www.google.com');
  t.is(fakeOut, undefined);
  t.is(fakeHeaders.location, 'www.google.com');
  t.is(fakeHead.statusCode, defaultRedirectStatus);
});
