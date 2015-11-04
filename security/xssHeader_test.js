/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , xssHeader = require('./xssHeader')
    , chromeOSXUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36'
    , IE11UA = 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko'
    , IE11UA2 = 'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'
    , IE8UA = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)'
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
            req.headers['user-agent'] = chromeOSXUA;

            assert.strictEqual(xssHeader(config, res, req).headers['X-XSS-Protection'], '1; mode=block');
        });

        it('should set the correct header if new IE', () => {
            req.headers['user-agent'] = IE11UA2;
            assert.strictEqual(xssHeader(config, res, req).headers['X-XSS-Protection'], '1; mode=block');

            req.headers['user-agent'] = IE11UA;
            assert.strictEqual(xssHeader(config, res, req).headers['X-XSS-Protection'], '1; mode=block');
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
