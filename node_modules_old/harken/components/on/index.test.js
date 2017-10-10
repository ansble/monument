/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , subject = require('./index')
      , eventStore = require('../store');

describe('on::tests', () => {

  it('should have  an "on" function', () => {
    assert.isFunction(subject);
  });

  afterEach(() => {
    eventStore['some-event'] = [];
  });

  it('should allow an object with named keys instead of function params', () => {
    assert.strictEqual(eventStore['some-event'].length, 0);

    subject({
      eventName: 'some-event'
      , handler: () => {}
      , scope: {}
      , once: true
    });

    assert.strictEqual(eventStore['some-event'].length, 1);
  });

  it('allows an object with named keys instead of function params for once and handler', () => {
    assert.strictEqual(eventStore['some-event'].length, 0);

    subject({
      eventName: 'some-event'
      , handler: () => {}
      , once: true
    });

    assert.strictEqual(eventStore['some-event'].length, 1);
  });

  it('should allow an object with named keys instead of function params for handler', () => {
    assert.strictEqual(eventStore['some-event'].length, 0);

    subject({
      eventName: 'some-event'
      , handler: () => {}
    });

    assert.strictEqual(eventStore['some-event'].length, 1);
  });

  it('should be able to add additional listeners to the same event', () => {
    assert.strictEqual(eventStore['some-event'].length, 0);

    subject({
      eventName: 'some-event'
      , handler: () => {}
    });

    subject({
      eventName: 'some-event'
      , handler: function () {
        console.log(this.some);
      }
      , scope: { some: true }
    });

    subject('some-event', () => {}, { test: true });

    assert.strictEqual(eventStore['some-event'].length, 3);
  });

  it('should not add a new listener that is indentical to an old listener', () => {
    const scope = { test: true };

    assert.strictEqual(eventStore['some-event'].length, 0);

    subject('some-event', () => {}, scope);
    subject('some-event', () => {}, scope);
    subject({
      eventName: 'some-event'
      , handler: () => {}
      , scope: scope
    });

    assert.strictEqual(eventStore['some-event'].length, 1);

    subject('some-event', () => {});
    subject({
      eventName: 'some-event'
      , handler: () => {}
    });

    assert.strictEqual(eventStore['some-event'].length, 2);
  });
});
