/* eslint-env node, mocha */
'use strict';

const test = require('ava')
      , setStatus = require('./setStatus')
      , fakeResFilled404 = {
        statusCode: 404
        , statusMessage: 'Not Found'
        , setStatus: setStatus
      }
      , fakeResFilled400 = {
        statusCode: 400
        , statusMessage: 'Bad Request'
        , setStatus: setStatus
      }
      , fakeResFilled500 = {
        statusCode: 500
        , statusMessage: 'Internal Server Error'
        , setStatus: setStatus
      };

let fakeRes;

// describe('setStatus function of response object', (t) => {
test.beforeEach(() => {
  fakeRes = {
    setStatus: setStatus
  };
});

test('should be defined as a function', (t) => {
  t.is(typeof fakeRes.setStatus, 'function');
});

test('should return a the response object', (t) => {
  t.is(typeof fakeRes.setStatus(), 'object');
  t.is(fakeRes.setStatus(), fakeRes);
});

test('should set data by a string that is an http status message', (t) => {
  fakeRes.setStatus('Not Found');
  t.is(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled404));
});

test('should set data by a number that is an http status code', (t) => {
  fakeRes.setStatus(404);
  t.is(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled404));
});

test('should not set data by a string that is not http status message', (t) => {
  fakeRes.setStatus('Testing Not Found');
  t.is(JSON.stringify(fakeRes), JSON.stringify({}));
});

test('should not set data by a number that is not http status code', (t) => {
  fakeRes.setStatus(4040);
  t.is(JSON.stringify(fakeRes), JSON.stringify({}));
});

test('should return the response object if values are set by status message string', (t) => {
  t.is(fakeRes.setStatus('Not Found'), fakeRes);
});

test('should return response object if values are set by status message code', (t) => {
  t.is(fakeRes.setStatus(404), fakeRes);
});

test('should return resonse Object if values are set by status message string', (t) => {
  t.is(fakeRes.setStatus('Testing Not Found'), fakeRes);
});

test('should return response object if values are set by status message code', (t) => {
  t.is(fakeRes.setStatus(4040), fakeRes);
});

test('should return response object for string "Bad Request"', (t) => {
  t.is(fakeRes.setStatus('Bad Request'), fakeRes);
});

test('should return response object for status code 400', (t) => {
  t.is(fakeRes.setStatus(400), fakeRes);
});

test('should set data for string "Bad Request"', (t) => {
  fakeRes.setStatus('Bad Request');
  t.is(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled400));
});

test('should set data for status code 400', (t) => {
  fakeRes.setStatus(400);
  t.is(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled400));
});

test('should return resonse object for string "Internal Server Error"', (t) => {
  t.is(fakeRes.setStatus('Internal Server Error'), fakeRes);
});
test('should return resonse object for status code 500', (t) => {
  t.is(fakeRes.setStatus(500), fakeRes);
});
test('should set data for string "Internal Server Error"', (t) => {
  fakeRes.setStatus('Internal Server Error');
  t.is(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled500));
});
test('should set data for status code 500', (t) => {
  fakeRes.setStatus(500);
  t.is(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled500));
});
