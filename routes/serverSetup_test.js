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
});
