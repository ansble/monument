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
        assert.throws(setup, "This doesn't appear to be a directory full of route handlers");
        assert.throws(() => {
            setup('somewhere', 'else');
        }, "This doesn't appear to be a directory full of route handlers");
        assert.throws(() => {
            setup('./test_stubs/routes_stub.json', 'else');
        }, "This doesn't appear to be a directory full of route handlers");
    });
});
