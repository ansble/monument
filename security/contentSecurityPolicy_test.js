/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , csp = require('./contentSecurityPolicy')
    , config = {};

let res = {};

describe('content security policy', () => {
    beforeEach(() => {
        res = {};
        res.headers = {};
        res.setHeader = function (key, value) {
            this.headers[key] = value;
        };

        config.security = {};
    });

    it('returns a function', () => {
        assert.isFunction(csp);
    });
});
