/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , frameguard = require('./frameguard')
    , config = {};

let res = {};

describe('frameguard', () => {
    beforeEach(() => {
        res = {};
        res.headers = {};
        res.setHeader = function (key, value) {
            this.headers[key] = value;
        };

        config.security = {};
    });

    it('returns a function', () => {
        assert.isFunction(frameguard);
    });

    describe('with proper input', () => {

        it('sets header to SAMEORIGIN with no arguments', () => {
            assert.strictEqual(frameguard(config, res).headers['X-Frame-Options'], 'SAMEORIGIN');
        });

        it('sets header to DENY when called with lowercase "deny"', () => {
            config.security.frameguard = {};
            config.security.frameguard.action = 'deny';
            assert.strictEqual(frameguard(config, res).headers['X-Frame-Options'], 'DENY');
        });

        it('sets header to DENY when called with uppercase "DENY"', () => {
            config.security.frameguard = {};
            config.security.frameguard.action = 'DENY';
            assert.strictEqual(frameguard(config, res).headers['X-Frame-Options'], 'DENY');
        });

        it('sets header to SAMEORIGIN when called with lowercase "sameorigin"', () => {
            config.security.frameguard = {};
            config.security.frameguard.action = 'sameorigin';
            assert.strictEqual(frameguard(config, res).headers['X-Frame-Options'], 'SAMEORIGIN');
        });

        it('sets header to SAMEORIGIN when called with uppercase "SAMEORIGIN"', () => {
            config.security.frameguard = {};
            config.security.frameguard.action = 'SAMEORIGIN';
            assert.strictEqual(frameguard(config, res).headers['X-Frame-Options'], 'SAMEORIGIN');
        });

        it('sets header properly when called with lowercase "allow-from"', () => {
            config.security.frameguard = {};
            config.security.frameguard.action = 'allow-from';
            config.security.frameguard.domain = 'designfrontier.net';

            const result = frameguard(config, res);

            assert.strictEqual(result.headers['X-Frame-Options'], 'ALLOW-FROM designfrontier.net');
        });

        it('sets header properly when called with uppercase "ALLOW-FROM"', () => {
            config.security.frameguard = {};
            config.security.frameguard.action = 'ALLOW-FROM';
            config.security.frameguard.domain = 'designfrontier.net';

            const result = frameguard(config, res);

            assert.strictEqual(result.headers['X-Frame-Options'], 'ALLOW-FROM designfrontier.net');
        });
    });

    describe('with improper input', () => {
        const createConfig = (action, options) => {
                return {
                    security: {
                        frameguard: {
                            action: action
                            , domain: options
                        }
                    }
                };
            }
            , wrapForThrow = (configIn) => {
                return () => {
                    frameguard(configIn);
                };
            }
            , refError = 'X-Frame must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN"'
            , optionError = 'X-Frame: ALLOW-FROM requires an option in config.security.frameguard parameter'

            , badNumericalInput = 123
            , badArrayOfURLs = [ 'http://website.com', 'http//otherwebsite.com' ]
            , badArrayFirst = [ 'ALLOW-FROM', 'http://example.com' ];

        it('fails with a bad first argument', () => {
            assert.throws(wrapForThrow(createConfig(' ')), refError);
            assert.throws(wrapForThrow(createConfig('denyy')), refError);
            assert.throws(wrapForThrow(createConfig('DENNY')), refError);
            assert.throws(wrapForThrow(createConfig(' deny ')), refError);
            assert.throws(wrapForThrow(createConfig(' DENY ')), refError);
            assert.throws(wrapForThrow(createConfig(badNumericalInput)), refError);
            assert.throws(wrapForThrow(createConfig(false)), refError);
            assert.throws(wrapForThrow(createConfig(null)), refError);
            assert.throws(wrapForThrow(createConfig({})), refError);
            assert.throws(wrapForThrow(createConfig([])), refError);
            assert.throws(wrapForThrow(createConfig(badArrayFirst)), refError);
            assert.throws(wrapForThrow(createConfig(/cool_regex/g)), refError);
        });

        it('fails with a bad second argument if the first is "ALLOW-FROM"', () => {
            assert.throws(wrapForThrow(createConfig('ALLOW-FROM')), optionError);
            assert.throws(wrapForThrow(createConfig('ALLOW-FROM', null)), optionError);
            assert.throws(wrapForThrow(createConfig('ALLOW-FROM', false)), optionError);
            assert.throws(wrapForThrow(createConfig('ALLOW-FROM', badNumericalInput)), optionError);
            assert.throws(wrapForThrow(createConfig('ALLOW-FROM', badArrayOfURLs)), optionError);
        });

    });

});
