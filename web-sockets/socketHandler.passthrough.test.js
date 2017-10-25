'use strict';

const test = require('ava')
      , subject = require('./socketHandler')
      , events = require('harken')
      , handler = subject('passthrough');

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
  t.is(typeof subject('passthrough'), 'function');
});

test('should not emit events for data event messages', (t) => {
  const socket = {};

  handler(socket);

  socket.onmessage({
    data: '{ "event": "data:get:test" }'
  });

  t.is(typeof events.listeners('data:set:test'), 'undefined');
});

test.cb('should emit events for non-data event messages', (t) => {
  const socket = {};

  handler(socket);

  events.once('some:event', () => {
    t.is(true, true);
    t.end();
  });

  socket.onmessage({
    data: '{ "event": "some:event" }'
  });
});

test.cb('should pass the message and socket through to passthrough events', (t) => {
  const socket = {};

  handler(socket);

  events.once('some:event', (data) => {
    t.is(typeof data, 'object');
    t.is(typeof data.message, 'object');
    t.is(typeof data.socket, 'object');
    t.deepEqual(Object.keys(socket), Object.keys(data.socket));
    t.is(data.message.event, 'some:event');
    t.end();
  });

  socket.onmessage({
    data: '{ "event": "some:event" }'
  });
});

test.cb('should pass message and socket through to data new events', (t) => {
  const socket = {};

  handler(socket);

  events.once('data:new:person', (data) => {
    t.is(typeof data, 'object');
    t.is(typeof data.message, 'object');
    t.is(typeof data.message.payload, 'object');
    t.is(typeof data.socket, 'object');
    t.deepEqual(Object.keys(socket), Object.keys(data.socket));
    t.is(data.message.event, 'data:new:person');
    t.end();
  });

  socket.onmessage({
    data: '{ "event": "data:new:person", "payload": { "name": "daniel" } }'
  });
});
