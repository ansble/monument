

const test = require('ava'),
      tools = require('./tools');

test('should return an object', t => {
  t.is(typeof tools, 'object');
  t.is(typeof tools.isDefined, 'function');
  t.is(typeof tools.isUndefined, 'function');
  t.is(typeof tools.not, 'function');
});

test('.isDefined::should return false it the item is undefined', t => {
  const some = {};

  t.is(tools.isDefined(some.test), false);
});

test('.isDefined::should return true it the item is defined', t => {
  const some = {
    test: true
  };

  t.is(tools.isDefined(some.test), true);
});

test('.isUndefined::should return true it the item is undefined', t => {
  const some = {};

  t.is(tools.isUndefined(some.test), true);
});

test('.isUndefined::should return false it the item is defined', t => {
  const some = {
    test: true
  };

  t.is(tools.isUndefined(some.test), false);
});

test('.not::should return false if true is passed to it', t => {
  t.is(tools.not(true), false);
});

test('.contains::should be a function', t => {
  t.is(typeof tools.contains, 'function');
});

test('.contains::should return true if it is in the array', t => {
  t.is(tools.contains(['1', '2', '3'], '1'), true);
});

test('.contains::should return false if it is not in the array', t => {
  t.is(tools.contains(['1', '2', '3'], '4'), false);
});