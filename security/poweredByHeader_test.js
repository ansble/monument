'use strict';

const assert = require('chai').assert
    , poweredByHeader = require('./poweredByHeader');

let res = {}
    , config = {};

describe('Security Headers: x-powered-by Tests', () => {
    beforeEach(() => {
        res.headers = {};

        res.setHeader = function (key, value) {
            this.headers[key] = value;
        };

        config.security = {};
    });

    it('should return a function', () => {
        assert.isFunction(poweredByHeader);
    });

    it('should not set a header if there is no option to in config', () => {
        poweredByHeader(config, res);

        assert.isUndefined(res.headers['X-Powered-By']);
    });

    it('should set a header if a value for one is in config', () => {
        config.security.poweredBy = 'bacon';
        poweredByHeader(config, res);

        assert.strictEqual(res.headers['X-Powered-By'], 'bacon');
    });

    it('should return res when executed', () => {
        assert.strictEqual(res, poweredByHeader(config, res));
    });
});
