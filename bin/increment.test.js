/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , increment = require('./increment');

describe('increment tests', () => {
  it('should be a function', () => {
    assert.isFunction(increment);
  });

  it('should increment only patch when incrementing patch', () => {
    assert.strictEqual('1.2.4', increment('1.2.3', 'patch'));
  });

  it('should increment minor and roll patch when incrementing minor', () => {
    assert.strictEqual('1.3.0', increment('1.2.3', 'minor'));
  });

  it('should increment major and roll minor and patch when incrementing major', () => {
    assert.strictEqual('2.0.0', increment('1.2.3', 'major'));
  });
});
