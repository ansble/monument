'use strict';

const test = require('ava')
      , subject = require('./socketHandler');

// NOTE: These test cover the moving parts of the web socket setup
//  they don't cover the actual web socket server itself, that module
//  is maintained outside the code base and should be tested independently
//  but this is a nice comprimise.

test.afterEach(() => {
  const events = require('harken');

  events.removeAllListeners();
});

test('should be a function and return a function', (t) => {
  t.is(typeof subject, 'function');
  t.is(typeof subject('data'), 'function');
});

test.cb('should emit events for data event messages', (t) => {
  const socket = {
          send: () => {}
        }
        , events = require('harken');

  events.once('data:get:test', (testObj) => {
    t.is(typeof testObj, 'undefined');
    t.end();
  });

  subject('data', events)(socket, events);

  socket.onmessage({
    data: '{ "event": "data:get:test" }'
  });
});

test('should not emit events for non-data event messages', (t) => {
  const socket = {
          send: () => {}
        }
        , events = require('harken');

  subject('data', events)(socket);

  socket.onmessage({
    data: '{ "event": "some:event" }'
  });

  t.is(typeof events.listeners('some:event'), 'undefined');
});

test('should not emit events for invalid JSON data', (t) => {
  const socket = {
          send: () => {}
        }
        , events = require('harken');

  subject('data', events)(socket);

  socket.onmessage({
    data: '"event" : "some:event"'
  });

  t.is(typeof events.listeners('some:event'), 'undefined');
});

test.cb('should return a string when responding to a socket', (t) => {
  const socket = {
          send: (message) => {
            t.is(typeof message, 'string');
            t.end();
          }
        }
        , events = require('harken');

  subject('data', events)(socket);

  events.once('data:get:test', () => {
    console.log('>>>>>>>>>>>>><<<<<<<<<<<<');
    events.emit('data:set:test', { test: true });
  });

  socket.onmessage({
    data: '{ "event": "data:get:test" }'
  });
});
