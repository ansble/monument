'use strict';

const test = require('ava')
      , subject = require('./socketHandler')
      , events = require('harken')
      , handler = subject(true, events);

// NOTE: These test cover the moving parts of the web socket setup
//  they don't cover the actual web socket server itself, that module
//  is maintained outside the code base and should be tested independently
//  but this is a nice comprimise.

test.after(() => {
  events.off('data:set:test');
  events.off('data:get:test');
  events.off('data:get:test2');
});

test('should be a function and return a function', (t) => {
  t.is(typeof subject, 'function');
  t.is(typeof subject(true), 'function');
});

test.cb('should emit events for data event messages', (t) => {
  const socket = {};

  events.once('data:get:test2', (testObj) => {
    t.is(typeof testObj, 'undefined');
    t.end();
  });

  handler(socket);

  socket.onmessage({
    data: '{ "event": "data:get:test2" }'
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

test.cb('should emit error:ws when error is occuring', (t) => {
  const socket = {
    send: (message, callback) => {
      callback('Some error');
      t.is(events.listeners('error:ws').length, 1);
    }
  };

  t.plan(2);

  handler(socket);

  socket.onmessage({
    data: '{ "event": "data:get:test" }'
  });

  events.once('data:get:test', () => {
    events.emit('data:set:test', { test: true });
  });

  events.once('error:ws', (message) => {
    t.is(typeof message, 'object');
    t.end();
  });
});
