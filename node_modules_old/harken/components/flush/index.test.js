/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , subject = require('./index')
      , eventStore = require('../store');

describe('flush::tests', () => {

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

  it('should eliminate all listeners', () => {
    subject();
    Object.keys(eventStore).forEach((key) => {
      assert.strictEqual(eventStore[key].length, 0);
    });
  });
});
