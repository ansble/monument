/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , subject = require('./index');

describe('store::tests', () => {

  it('should export an object', () => {
    assert.isObject(subject);
  });
});
