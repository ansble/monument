/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
      , subject = require('./index');

describe('compare::tests', () => {

  it('should have be a function', () => {
    assert.isFunction(subject);
  });

  describe('compare functions', () => {
    it('should tell if two anon functions are the same function', () => {
      assert.strictEqual(true, subject(() => {
        console.log('test');
      }, () => {
        console.log('test');
      }));

      assert.strictEqual(false, subject(() => {
        console.log('test');
      }, () => {
        console.log('sam');
      }));
    });

    it('should tell if two functions are the same function', () => {
      const test = () => {
        console.log('this is cool');
      };

      assert.strictEqual(true, subject(test, test));
      assert.strictEqual(true, subject(test, () => {
        console.log('this is cool');
      }));

      assert.strictEqual(false, subject(test, () => {
        console.log('this is');
      }));
    });
  });

  describe('compare scope objects', () => {
    it('should be able to compare two scope objects', () => {
      const scope = {};

      assert.strictEqual(true, subject(scope, scope), 'scope var should equale scope var');
      assert.strictEqual(false, subject(scope, {}), 'scope var shouldn\'t equal anon object');
      assert.strictEqual(false, subject(scope, undefined), 'scope var shouldn\'t equal undefiend');
    });
  });

  describe('compare bools', () => {
    it('should be able to compare two bools', () => {
      assert.strictEqual(true, subject(true, true));
      assert.strictEqual(false, subject(false, true));
    });
  });

  describe('compare strings', () => {
    it('should be able to compare two strings', () => {
      assert.strictEqual(true, subject('true', 'true'));
      assert.strictEqual(false, subject('false', 'true'));
    });
  });

  describe('compare numbers', () => {
    it('should be able to compare two numbers', () => {
      assert.strictEqual(true, subject(1, 1));
      assert.strictEqual(false, subject(1, 2));
    });
  });
});
