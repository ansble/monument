'use strict';

const test = require('ava')
      , subject = require('./socketHandler')
      , events = require('harken')
      , handler = subject(false, events);

// NOTE: These test cover the moving parts of the web socket setup
//  they don't cover the actual web socket server itself, that module
//  is maintained outside the code base and should be tested independently
//  but this is a nice comprimise.

test.afterEach(() => {
  events.off('data:set:test');
  events.off('data:get:test');
  events.off('some:event');
});

test('should be a function and return a function', (t) => {
  t.is(typeof subject, 'function');
  t.is(typeof subject(false), 'function');
});

test('should not emit events for data event messages', (t) => {
  const socket = {};

  handler(socket);

  socket.onmessage({
    data: '{ "event": "data:get:test" }'
  });

  t.is(typeof events.listeners('data:set:test'), 'undefined');
});

test.cb('should not emit events for non-data event messages', (t) => {
  const socket = {};

  handler(socket);
  events.on('some:event', (data) => {
    if (typeof data === 'undefined') {
      t.is(true, false);
    } else {
      t.end();
    }
  });

  socket.onmessage({
    data: '{ "event": "some:event" }'
  });

  setTimeout(() => {
    events.emit('some:event', true);
  }, 0);
});
