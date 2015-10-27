'use strict';

const assert = require('chai').assert
    , noOpen = require('./noOpen');

let res = {}
    , config = {};

describe('Security Headers: X-Download-Options Tests', () => {
    beforeEach(() => {
        res.headers = {};
        res.setHeader = function (key, value) {
            this.headers[key] = value;
        };

        config.security = {};
    });

    it('should return a function', () => {
        assert.isFunction(noOpen);
    });

    it('should set a header if there is no option in config', () => {
        noOpen(config, res);

        assert.strictEqual(res.headers['X-Download-Options'], 'noopen');
    });

    it('should set a header if the config is true', () => {
        config.security.noOpen = true;
        noOpen(config, res);

        assert.strictEqual(res.headers['X-Download-Options'], 'noopen');
    });

    it('should not set a header if the config is false', () => {
        config.security.noOpen = false;
        noOpen(config, res);

        assert.isUndefined(res.headers['X-Download-Options']);
    });

    it('should return res when executed', () => {
        assert.strictEqual(res, noOpen(config, res));
    });
});
