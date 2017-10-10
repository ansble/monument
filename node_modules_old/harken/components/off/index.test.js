/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , subject = require('./index')
      , eventStore = require('../store');

describe('off::tests', () => {

  beforeEach(() => {
    eventStore['test-event'] = [
      {
        call: () => {}
        , once: true
        , scope: {}
        , created: new Date()
      }
      , {
        call: () => {}
        , once: false
        , scope: {}
        , created: new Date()
      }
    ];

    eventStore['test-ey'] = [
      {
        call: () => {}
        , once: true
        , scope: {}
        , created: new Date()
      }
      , {
        call: () => {}
        , once: false
        , scope: {}
        , created: new Date()
      }
    ];
  });

  it('should have  be a function', () => {
    assert.isFunction(subject);
  });

  it('should eliminate all listeners to an event when called without function', () => {
    subject('test-event');
    assert.strictEqual(eventStore['test-event'].length, 0);
  });

  it('should eliminate only listeners that match the params passed in', () => {
    subject('test-event', () => {}, true);
    assert.strictEqual(eventStore['test-event'].length, 1);

    subject('test-ey', () => {});
    assert.strictEqual(eventStore['test-ey'].length, 0);
  });
});
