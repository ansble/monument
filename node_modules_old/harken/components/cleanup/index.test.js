/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , subject = require('./index')
      , eventStore = require('../store');

describe('cleanup::tests', () => {

  it('should have  be a function', () => {
    assert.isFunction(subject);
  });

  it('should remove any lingering once listeners over the age of 1200000ms', () => {
    eventStore['test-event'] = [ {
      handler: function () {}
      , scope: {}
      , once: true
      , created: new Date('12/10/1983')
    } ];
    assert.strictEqual(eventStore['test-event'].length, 1);

    subject();

    assert.strictEqual(eventStore['test-event'].length, 0);
  });

  it('should not remove any lingering non-once listeners over the age of 1200000ms', () => {
    eventStore['test-event'] = [ {
      handler: function () {}
      , scope: {}
      , once: false
      , created: new Date('12/10/1983')
    } ];
    assert.strictEqual(eventStore['test-event'].length, 1);

    subject();

    assert.strictEqual(eventStore['test-event'].length, 1);
  });
});
