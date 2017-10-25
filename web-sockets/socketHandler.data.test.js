'use strict';

const test = require('ava')
      , subject = require('./socketHandler')
      , events = require('harken')
      , handler = subject('data');

// NOTE: These test cover the moving parts of the web socket setup
//  they don't cover the actual web socket server itself, that module
//  is maintained outside the code base and should be tested independently
//  but this is a nice comprimise.

test.afterEach(() => {
  events.off('data:set:test');
  events.off('data:get:test');
});

test('should be a function and return a function', (t) => {
  t.is(typeof subject, 'function');
  t.is(typeof subject('data'), 'function');
});

test.cb('should emit events for data event messages', (t) => {
  const socket = {};

  events.once('data:get:test', (testObj) => {
    t.is(typeof testObj, 'undefined');
    t.end();
  });

  handler(socket);

  socket.onmessage({
    data: '{ "event": "data:get:test" }'
  });
});

test('should not emit events for non-data event messages', (t) => {
  const socket = {};

  handler(socket);

  socket.onmessage({
    data: '{ "event": "some:event" }'
  });

  t.is(events.listeners('some:event').length, 0);
});

test('should not emit events for invalid JSON data', (t) => {
  const socket = {};

  handler(socket);

  socket.onmessage({
    data: '"event" : "some:event"'
  });

  t.is(events.listeners('some:event').length, 0);
});

test.cb('should return a string when responding to a socket', (t) => {
  const socket = {
    send: (message) => {
      t.is(typeof message, 'string');
      t.end();
    }
  };

  handler(socket);

  events.once('data:get:test', () => {
    events.emit('data:set:test', { test: true });
  });

  socket.onmessage({
    data: '{ "event": "data:get:test" }'
  });
});
