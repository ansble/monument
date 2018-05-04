'use strict';

const test = require('ava')
      , setup = require('./serverSetup');

test('should be correctly defined', (t) => {
  t.is(typeof setup, 'function');
});

test('should return the list of public folders', (t) => {
  t.true(Array.isArray(setup('./test_stubs', './test_stubs/templates')));
});

test('should throw if an invalid value for routePath is passed', (t) => {
    const invalidPathString = '(TypeError \[ERR_INVALID_ARG_TYPE\]: The "path" argument must be one of type string, Buffer, or URL. Received type undefined)' +
      '| (TypeError: path must be a string or Buffer)';
  t.throws(setup, new RegExp(invalidPathString), TypeError);
  t.throws(() => {
    setup('somewhere', 'else');
  }, 'Error: ENOENT: no such file or directory, scandir \'somewhere\'');
  t.throws(() => {
    setup('./test_stubs/routes_stub.json', 'else');
  }, 'Error: ENOTDIR: not a directory, scandir \'./test_stubs/routes_stub.json\'');
});
