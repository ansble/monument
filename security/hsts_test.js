/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , hsts = require('./hsts')
    , res = {}
    , config = {};

describe('Security Headers: Strict-Transport-Security Tests', () => {
    beforeEach(() => {
        res.headers = {};
        res.setHeader = function (key, value) {
            this.headers[key] = value;
        };

        config.security = {};
    });

    it('should return a function', () => {
        assert.isFunction(hsts);
    });

    it('should set a header if there is no option in config', () => {
        hsts(config, res);

        const result = res.headers['Strict-Transport-Security'];

        assert.strictEqual(result, 'max-age=86400; includeSubdomains; preload');
    });

    it('should set a header if the config is true', () => {
        config.security.hsts = true;
        hsts(config, res);

        const result = res.headers['Strict-Transport-Security'];

        assert.strictEqual(result, 'max-age=86400; includeSubdomains; preload');
    });

    it('should set a header with a different max age if passed in', () => {
        config.security.hsts = {
            maxAge: 100
        };
        hsts(config, res);

        const result = res.headers['Strict-Transport-Security'];

        assert.strictEqual(result, 'max-age=100; includeSubdomains; preload');
    });

    it('should set a header with a different max age and no includeSubdomains if passed in', () => {
        config.security.hsts = {
            maxAge: 100
            , includeSubDomains: false
        };
        hsts(config, res);

        const result = res.headers['Strict-Transport-Security'];

        assert.strictEqual(result, 'max-age=100; preload');
    });

    it('should set a header with no includeSubdomains if passed in', () => {
        config.security.hsts = {
            includeSubDomains: false
        };
        hsts(config, res);

        const result = res.headers['Strict-Transport-Security'];

        assert.strictEqual(result, 'max-age=86400; preload');
    });

    it('should set a header with no preload if passed in', () => {
        config.security.hsts = {
            preload: false
        };
        hsts(config, res);

        const result = res.headers['Strict-Transport-Security'];

        assert.strictEqual(result, 'max-age=86400; includeSubdomains');
    });

    it('should set a header with a different max age and no preloads if passed in', () => {
        config.security.hsts = {
            maxAge: 100
            , preload: false
        };
        hsts(config, res);

        const result = res.headers['Strict-Transport-Security'];

        assert.strictEqual(result, 'max-age=100; includeSubdomains');
    });

    it('should set a header with a different max age and other options off if passed in', () => {
        config.security.hsts = {
            maxAge: 100
            , includeSubDomains: false
            , preload: false
        };
        hsts(config, res);

        const result = res.headers['Strict-Transport-Security'];

        assert.strictEqual(result, 'max-age=100');
    });

    it('should set a header with a default max age and other options off if passed in', () => {
        config.security.hsts = {
            includeSubDomains: false
            , preload: false
        };
        hsts(config, res);

        const result = res.headers['Strict-Transport-Security'];

        assert.strictEqual(result, 'max-age=86400');
    });

    it('should not set a header if the config is false', () => {
        config.security.hsts = false;
        hsts(config, res);

        const result = res.headers['Strict-Transport-Security'];

        assert.isUndefined(result);
    });

    it('should throw an error if a bad value for maxAge is passed in', () => {
        config.security.hsts = {
            maxAge: -1000
        };

        assert.throws(() => {
            hsts(config, res);
        });

        config.security.hsts = {
            maxAge: 'Sam I am'
        };

        assert.throws(() => {
            hsts(config, res);
        });
    });

    it('should return res when executed', () => {
        assert.strictEqual(res, hsts(config, res));
    });
});
