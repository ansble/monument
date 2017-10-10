/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , subject = require('./index')
      , eventStore = require('../store');

describe('listeners::tests', () => {

  it('should have  be a function', () => {
    assert.isFunction(subject);
  });

  it('should return an array of all listeners', () => {
    eventStore['some-event'] = [ { call: function () {} } ];

    assert.isArray(subject('some-event'));
    assert.lengthOf(subject('some-event'), 1);
  });
});
