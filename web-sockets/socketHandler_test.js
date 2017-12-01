/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , subject = require('./socketHandler')
      , events = require('harken');

describe('WebSocket handler Tests', () => {
  // NOTE: These test cover the moving parts of the web socket setup
  //  they don't cover the actual web socket server itself, that module
  //  is maintained outside the code base and should be tested independently
  //  but this is a nice comprimise.

  describe('Web Socket Handler Type: false tests', () => {
    const handler = subject(false);

    afterEach(() => {
      events.off('data:set:test');
      events.off('data:get:test');
      events.off('some:event');
    });

    it('should be a function and return a function', () => {
      assert.isFunction(subject);
      assert.isFunction(subject(false));
    });

    it('should not emit events for data event messages', () => {
      const socket = {};

      handler(socket);

      socket.onmessage({
        data: '{ "event": "data:get:test" }'
      });

      assert.isUndefined(events.listeners('data:set:test'));
    });

    it('should not emit events for non-data event messages', (done) => {
      const socket = {};

      handler(socket);
      events.on('some:event', (data) => {
        if (typeof data === 'undefined') {
          assert.strictEqual(true, false);
        } else {
          done();
        }
      });

      socket.onmessage({
        data: '{ "event": "some:event" }'
      });

      setTimeout(() => {
        events.emit('some:event', true);
      }, 0);
    });
  });

  describe('Web Socket Handler Type: true tests', () => {
    const handler = subject(true);

    afterEach(() => {
      events.off('data:set:test');
      events.off('data:get:test');
    });

    it('should be a function and return a function', () => {
      assert.isFunction(subject);
      assert.isFunction(subject(true));
    });

    it('should emit events for data event messages', (done) => {
      const socket = {};

      events.once('data:get:test', (test) => {
        assert.isUndefined(test);
        done();
      });

      handler(socket);

      socket.onmessage({
        data: '{ "event": "data:get:test" }'
      });
    });

    it('should pass message and socket through to data new events', (done) => {
      const socket = {};

      handler(socket);

      events.once('data:new:person', (data) => {
        assert.isObject(data);
        assert.isObject(data.message);
        assert.isObject(data.message.payload);
        assert.isObject(data.socket);
        assert.strictEqual(socket, data.socket);
        assert.strictEqual(data.message.event, 'data:new:person');
        done();
      });

      socket.onmessage({
        data: '{ "event": "data:new:person", "payload": { "name": "daniel" } }'
      });
    });

    it('should emit events for non-data event messages', (done) => {
      const socket = {};

      handler(socket);

      events.once('some:event', () => {
        assert.strictEqual(true, true);
        done();
      });

      socket.onmessage({
        data: '{ "event": "some:event" }'
      });
    });

    it('should pass the message and socket through to passthrough events', (done) => {
      const socket = {};

      handler(socket);

      events.once('some:event', (data) => {
        assert.isObject(data);
        assert.isObject(data.message);
        assert.isObject(data.socket);
        assert.strictEqual(socket, data.socket);
        assert.strictEqual(data.message.event, 'some:event');
        done();
      });

      socket.onmessage({
        data: '{ "event": "some:event" }'
      });
    });

    it('should emit error:ws when error is occuring', (done) => {
      const socket = {
        send: (message, callback) => {
          callback('Some error');
          assert.strictEqual(events.listeners('error:ws').length, 1);
          done();
        }
      };

      handler(socket);

      socket.onmessage({
        data: '{ "event": "data:get:test" }'
      });

      events.once('data:get:test', () => {
        events.emit('data:set:test', { test: true });
      });

      events.once('error:ws', (message) => {
        assert.isObject(message);
      });
    });
  });

  describe('Web Socket Handler Type: data tests', () => {
    const handler = subject('data');

    afterEach(() => {
      events.off('data:set:test');
      events.off('data:get:test');
    });

    it('should be a function and return a function', () => {
      assert.isFunction(subject);
      assert.isFunction(subject('data'));
    });

    it('should emit events for data event messages', (done) => {
      const socket = {};

      events.once('data:get:test', (test) => {
        assert.isUndefined(test);
        done();
      });

      handler(socket);

      socket.onmessage({
        data: '{ "event": "data:get:test" }'
      });
    });

    it('should not emit events for non-data event messages', () => {
      const socket = {};

      handler(socket);

      socket.onmessage({
        data: '{ "event": "some:event" }'
      });

      assert.strictEqual(events.listeners('some:event').length, 0);
    });

    it('should not emit events for invalid JSON data', () => {
      const socket = {};

      handler(socket);

      socket.onmessage({
        data: '"event" : "some:event"'
      });

      assert.strictEqual(events.listeners('some:event').length, 0);
    });

    it('should return a string when responding to a socket', (done) => {
      const socket = {
        send: (message) => {
          assert.isString(message);
          done();
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

    it('should handle errors for none passthrough events', (done) => {
      const socket = {};

      socket.send = (str, cb) => {
        cb(true);
      };

      handler(socket);

      socket.onmessage({
        data: '{ "event": "data:get:test" }'
      });

      events.once('error:ws', (err) => {
        assert.isObject(err);
        done();
      });

      events.emit('data:set:test', 'data');
    });

    it('should skip error handling when no error for none passthrough events', (done) => {
      const socket = {};

      socket.send = (str, cb) => {
        cb();
      };

      handler(socket);

      socket.onmessage({
        data: '{ "event": "data:get:test" }'
      });

      events.once('error:ws', () => {
        Error('error handling triggered');
        done();
      });

      events.emit('data:set:test', 'data');
    });
  });

  describe('Web Socket Handler Type: passthrough tests', () => {
    const handler = subject('passthrough');

    afterEach(() => {
      events.off('data:set:test');
      events.off('data:get:test');
    });

    it('should be a function and return a function', () => {
      assert.isFunction(subject);
      assert.isFunction(subject('passthrough'));
    });

    it('should not emit events for data event messages', () => {
      const socket = {};

      handler(socket);

      socket.onmessage({
        data: '{ "event": "data:get:test" }'
      });

      assert.strictEqual(events.listeners('data:set:test').length, 0);
    });

    it('should emit events for non-data event messages', (done) => {
      const socket = {};

      handler(socket);

      events.once('some:event', () => {
        assert.strictEqual(true, true);
        done();
      });

      socket.onmessage({
        data: '{ "event": "some:event" }'
      });
    });

    it('should pass the message and socket through to passthrough events', (done) => {
      const socket = {};

      handler(socket);

      events.once('some:event', (data) => {
        assert.isObject(data);
        assert.isObject(data.message);
        assert.isObject(data.socket);
        assert.strictEqual(socket, data.socket);
        assert.strictEqual(data.message.event, 'some:event');
        done();
      });

      socket.onmessage({
        data: '{ "event": "some:event" }'
      });
    });

    it('should pass message and socket through to data new events', (done) => {
      const socket = {};

      handler(socket);

      events.once('data:new:person', (data) => {
        assert.isObject(data);
        assert.isObject(data.message);
        assert.isObject(data.message.payload);
        assert.isObject(data.socket);
        assert.strictEqual(socket, data.socket);
        assert.strictEqual(data.message.event, 'data:new:person');
        done();
      });

      socket.onmessage({
        data: '{ "event": "data:new:person", "payload": { "name": "daniel" } }'
      });
    });
  });
});
