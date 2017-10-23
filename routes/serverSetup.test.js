/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , setup = require('./serverSetup');

describe('The Setup tests', () => {

  it('should be correctly defined', () => {
    assert.isFunction(setup);
  });

  it('should return the list of public folders', () => {
    assert.isArray(setup('./test_stubs', './test_stubs/templates'));
  });

  it('should throw if an invalid value for routePath is passed', () => {
    assert.throws(setup, 'TypeError: path must be a string or Buffer', TypeError);
    assert.throws(() => {
      setup('somewhere', 'else');
    }, 'Error: ENOENT: no such file or directory, scandir \'somewhere\'');
    assert.throws(() => {
      setup('./test_stubs/routes_stub.json', 'else');
    }, 'Error: ENOTDIR: not a directory, scandir \'./test_stubs/routes_stub.json\'');
  });
});
