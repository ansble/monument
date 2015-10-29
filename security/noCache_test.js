'use strict';

const assert = require('chai').assert
    , noCache = require('./noCache');

let res = {}
    , config = {};

describe('Security Headers: no cache!', () => {
    beforeEach(() => {
        res.headers = {};
        res.setHeader = function (key, value) {
            this.headers[key] = value;
        };

        res.removeHeader = function (key) {
            this.headers[key] = undefined;
        };

        config.security = {};
    });

    it('should return a function', () => {
        assert.isFunction(noCache);
    });

    it('should not set a header if there is no option in config', () => {
        noCache(config, res);

        assert.isUndefined(res.headers['Cache-Control']);
    });

    it('should set all the headers if the config is true', () => {
        config.security.noCache = true;
        noCache(config, res);

        assert.isDefined(res.headers['Cache-Control']);
        assert.isDefined(res.headers['Surrogate-Control']);
        assert.isDefined(res.headers.Pragma);
        assert.isDefined(res.headers.Expires);
    });

    it('should kill the etag and set all headers if the config.etag is true', () => {
        config.security.noCache = {noEtag: true};
        res.headers.ETag = 'someEtagString';

        noCache(config, res);

        assert.isDefined(res.headers['Cache-Control']);
        assert.isDefined(res.headers['Surrogate-Control']);
        assert.isDefined(res.headers.Pragma);
        assert.isDefined(res.headers.Expires);
        assert.isUndefined(res.headers.etag);
    });

    it('should return res when executed', () => {
        assert.strictEqual(res, noCache(config, res));
    });

    it('should add a noCache function to res when executed', () => {
        noCache(config, res);
        assert.isDefined(res.noCache);
        assert.isFunction(res.noCache);
    });
});
