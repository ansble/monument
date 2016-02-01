/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , config = require('./config')
    , path = require('path')
    , http = require('http');

describe('config Tests', () => {
    it('should return an object', () => {
        assert.isObject(config);
        assert.isFunction(config.set);
        assert.isFunction(config.get);
    });

    it('should set smart defaults', () => {
        const configObj = config.get();

        assert.strictEqual(configObj.port, 3000);
        assert.strictEqual(http, configObj.http);
        assert.strictEqual(configObj.routePath, path.join(process.cwd(), './routes.json'));
        assert.strictEqual(config.routeJSONPath, config.routePath);
        assert.strictEqual(configObj.publicPath, path.join(process.cwd(), './public'));
        assert.strictEqual(configObj.compress, true);
        assert.strictEqual(configObj.webSockets, false);
        assert.strictEqual(configObj.templatePath, path.join(process.cwd(), './templates'));
        assert.strictEqual(configObj.maxAge, 31536000);
        assert.strictEqual(configObj.etags, true);
        assert.isObject(configObj.security);
        assert.strictEqual(configObj.security.xssProtection, true);
        assert.strictEqual(configObj.security.poweredBy, '');
        assert.strictEqual(configObj.security.noSniff, true);
        assert.strictEqual(configObj.security.noCache, false);
        assert.isObject(configObj.security.framegaurd);
        assert.strictEqual(configObj.security.framegaurd.action, 'SAMEORIGIN');
        assert.isObject(configObj.security.hsts);
        assert.strictEqual(configObj.security.hsts.maxAge, 86400);
    });

    describe('config.get tests', () => {
        it('should return the whole config option when called with no value', () => {
            const configObj = config.get();

            assert.isObject(configObj);
        });

        it('should return the value if a key is passed in', () => {
            const value = config.get('port');

            assert.isNumber(value);
        });
    });

    describe('config.set tests', () => {
        it('should accept an object of settings', () => {
            config.set({
                port: 1234
                , routePath: '/etc/bin'
            });

            assert.strictEqual(config.get('port'), 1234);
            assert.strictEqual(config.get('routePath'), path.join(process.cwd(), '/etc/bin'));
        });

        it('should accept a key value pair of a setting', () => {
            config.set('port', 1212);

            assert.strictEqual(config.get('port'), 1212);
        });

        it('should return the configObject after setting', () => {
            const test = config.set('port', 1211);

            assert.isObject(test);
            assert.strictEqual(test.port, 1211);
        });
    });
});
