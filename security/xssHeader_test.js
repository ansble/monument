/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , xssHeader = require('./xssHeader')
    , userAgents = require('../test_stubs/userAgents.json')
    , chromeOSXUA = userAgents.chromeOSX
    , IE11UA = userAgents.IE11
    , IE11UA2 = userAgents.IE11v2
    , IE8UA = userAgents.IE8
    , res = {}
    , req = {}
    , config = {};

describe('Security Headers: X-XSS-Protection', () => {
    beforeEach(() => {
        req.headers = {};
        res.headers = {};

        res.setHeader = function (key, value) {
            this.headers[key] = value;
        };

        config.security = {};
    });

    it('should return a function', () => {
        assert.isFunction(xssHeader);
    });

    it('should return res when executed', () => {
        assert.strictEqual(res, xssHeader(config, res, req));
    });

    describe('default behaviors', () => {
        it('should set the correct header if old IE', () => {
            req.headers['user-agent'] = IE8UA;

            assert.strictEqual(xssHeader(config, res, req).headers['X-XSS-Protection'], '0');
        });

        it('should set the correct header if IE', () => {
            let result;

            req.headers['user-agent'] = chromeOSXUA;
            result = xssHeader(config, res, req);
            assert.strictEqual(result.headers['X-XSS-Protection'], '1; mode=block');
        });

        it('should set the correct header if new IE', () => {
            let result;

            req.headers['user-agent'] = IE11UA2;
            result = xssHeader(config, res, req);
            assert.strictEqual(result.headers['X-XSS-Protection'], '1; mode=block');

            req.headers['user-agent'] = IE11UA;
            result = xssHeader(config, res, req);
            assert.strictEqual(result.headers['X-XSS-Protection'], '1; mode=block');
        });
    });

    describe('disabled by config', () => {
        it('should not set the header if config.security.xssProtection is false', () => {
            config.security.xssProtection = false;

            req.headers['user-agent'] = IE11UA;
            assert.isUndefined(xssHeader(config, res, req).headers['X-XSS-Protection']);
        });
    });
});
