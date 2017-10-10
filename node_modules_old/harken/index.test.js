/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , eventStore = require('./components/store')
      , emitter = require('./index');

let test;

describe('Event Tests', () => {

  beforeEach(() => {
    test = true;
  });

  afterEach(() => {
    Object.keys(eventStore).forEach((key) => {
      emitter.off(key);
    });
  });

  describe('.addListener tests', () => {
    it('should be the same function as .on', () => {
      assert.strictEqual(emitter.on, emitter.addListener);
    });
  });

  describe('.on tests', () => {
    it('should have  an "on" function', () => {
      assert.isFunction(emitter.on);
    });

    it('should execute the callback passed to "on" when an event is triggered', (done) => {
      emitter.on('some-event', () => {
        assert.strictEqual(true, true);
        done();
      });

      emitter.emit('some-event');
    });

    it('executes the callback passed to "on" when an event triggers and recieves data', (done) => {
      emitter.on('some-event', (data) => {
        assert.isObject(data);
        done();
      });

      emitter.emit('some-event', { name: 'Tom Sawyer' });
    });

    it('should execute the callback passed to "on" with the scope passed in', (done) => {
      emitter.on('some-event', function (data) {
        // eslint-disable-next-line no-invalid-this
        assert.strictEqual(data.name, this.name);
        done();
      }, { name: 'Tom Sawyer' });

      emitter.emit('some-event', { name: 'Tom Sawyer' });
    });

    it('executes the callback passed to "on" with the scope passed only once when once', (done) => {
      let count = 0;

      emitter.on('some-event', () => {
        count++;

      }, {}, true);

      emitter.on('some-other-event', () => {
        assert.strictEqual(count, 1);
        done();
      });

      emitter.emit('some-event');
      emitter.emit('some-event');

      emitter.emit('some-other-event');
    });

    it('should allow an object with named keys instead of function params', (done) => {
      let count = 0;

      emitter.on({
        eventName: 'some-event'
        , handler: function () {
          count++;

        }
        , scope: {}
        , once: true
      });

      emitter.on('some-other-event', () => {
        assert.strictEqual(count, 1);
        done();
      });

      emitter.emit('some-event');
      emitter.emit('some-event');

      emitter.emit('some-other-event');
    });

    it('allows an object with keys instead of function params for once and handler', (done) => {
      let count = 0;

      emitter.on({
        eventName: 'some-event'
        , handler: function () {
          count++;

        }
        , once: true
      });

      emitter.on('some-other-event', () => {
        assert.strictEqual(count, 1);
        done();
      });

      emitter.emit('some-event');
      emitter.emit('some-event');

      emitter.emit('some-other-event');
    });

    it('should allow an object with named keys instead of function params for handler', (done) => {
      let count = 0;

      emitter.on({
        eventName: 'some-event'
        , handler: function () {
          count++;

        }
      });

      emitter.on('some-other-event', () => {
        assert.strictEqual(count, 2);
        done();
      });

      emitter.emit('some-event');
      emitter.emit('some-event');
      emitter.emit('some-other-event');
    });
  });

  describe('.once tests', () => {
    it('should have  a "once" function', () => {
      assert.isFunction(emitter.once);
    });

    it('should add an item to the eventStore with once set when called with params', () => {
      emitter.once('test', () => {}, {});

      assert.strictEqual(eventStore.test.length, 1);
      assert.strictEqual(eventStore.test[0].once, true);
    });

    it('should add an item to the eventStore with once set when called with object hash', () => {
      emitter.once({
        eventName: 'tests'
        , call: function () {}
        , scope: {}
      });

      assert.strictEqual(eventStore.tests.length, 1);
      assert.strictEqual(eventStore.tests[0].once, true);
    });
  });

  it('should have  an "removeListener" function', () => {
    assert.isFunction(emitter.removeListener);
  });

  it('should have  an "removeAllListeners" function', () => {
    assert.isFunction(emitter.removeAllListeners);
  });

  it('should have  an "emit" function', () => {
    assert.isFunction(emitter.emit);
  });

  describe('listeners function tests', () => {
    it('should have  an "listeners" function', () => {
      assert.isFunction(emitter.listeners);
    });

    it('should return an array of all listeners', () => {
      emitter.on('some-event', () => {
        test = false;
      });

      assert.isArray(emitter.listeners('some-event'));
      assert.lengthOf(emitter.listeners('some-event'), 1);
    });
  });

  it('should have  an "addListener" function', () => {
    assert.isFunction(emitter.addListener);
  });

  it('should have  a "required" function', () => {
    assert.isFunction(emitter.required);
  });

  describe('.off tests', () => {
    it('should have  an "off" function', () => {
      assert.isFunction(emitter.off);
    });

    it('should eliminate all listeners to an event when called without function', (done) => {
      emitter.on('some-event', () => {
        test = false;
      });

      emitter.off('some-event');

      emitter.emit('some-event');

      setTimeout(() => {
        assert.strictEqual(test, true);
        done();
      }, 1);
    });

  });

  describe('.removeListener tests', () => {
    it('should be the same function as .off', () => {
      assert.strictEqual(emitter.off, emitter.removeListener);
    });
  });

  describe('RemoveAllListeners tests', () => {
    it('should have  a "removeAllListeners" function', () => {
      assert.isFunction(emitter.removeAllListeners);
    });

    it('should eliminate all listeners to an event when called', (done) => {
      test = true;

      emitter.on('some-event', () => {
        test = false;
      });

      emitter.on('some-event', () => {
        test = !!test;
      });

      emitter.removeAllListeners('some-event');

      emitter.emit('some-event');

      setTimeout(() => {
        assert.strictEqual(test, true);
        done();
      }, 0);
    });

  });
});
