'use strict';

const test = require('ava')
      , shallowMerge = require('./shallowMerge');

test('should be a funciton', (t) => {
  t.is(typeof shallowMerge, 'function');
});

test('should not explode when called with no options', (t) => {
  t.notThrows(shallowMerge);
});

test('should merge the verbs from two standard route objects', (t) => {
  t.deepEqual(shallowMerge({ test: [ 'get' ] }, { test: [ 'rad' ] }).test, [ 'get', 'rad' ]);
});

test('should only return one instance of a verb from two standard route objects', (t) => {
  const testArr = shallowMerge({ test: [ 'get' ] }, { test: [ 'get', 'rad' ] }).test;

  t.deepEqual(testArr, [ 'get', 'rad' ]);
});

test('should copy over results that new', (t) => {
  const merge = shallowMerge({ test: [ 'g' ] }, { sam: [ 'run' ] });

  t.not(typeof merge.sam, 'undefined');
  t.deepEqual(merge.sam, [ 'run' ]);
});

test('should merge the verbs from two wildcard route objects', (t) => {
  const a = { test: { verbs: [ 'get' ] } }
        , b = { test: { verbs: [ 'rad' ] } }
        , testObj = shallowMerge(a, b).test;

  t.deepEqual(testObj.verbs, [ 'get', 'rad' ]);
});

test('should only return one instance of a verbs from two wildcard route objects', (t) => {
  const a = { test: { verbs: [ 'get' ] } }
        , b = { test: { verbs: [ 'get', 'rad' ] } }
        , testObj = shallowMerge(a, b).test;

  t.deepEqual(testObj.verbs, [ 'get', 'rad' ]);
});
