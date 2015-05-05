var assert = require('chai').assert
    , send = require('./send')

    , fakeRes
    , fakeOut
    , fakeEncode
    , obj;

describe('Send Tests', function () {
    'use strict';

    beforeEach(function () {
        fakeRes = {
            setHeader: function () {}
            , end: function (data, encode) {
                fakeOut = data;
                fakeEncode = encode;
            }
        };

        fakeRes.send = send({
            headers: {
                'accept-encoding': 'none'
                , 'if-none-match': ''
            }
        }, {compression: false});

        fakeOut = '';

        obj = {
            title: 'Tom Sawyer'
            , Author: 'Samuel Langhorne Clemens'
        };
    });

    it('should be defined as a function', function () {
        assert.isFunction(send);
    });

    it('should return a function', function () {
        assert.isFunction(send({}, {}));
    });

    it('should handle an empty data object', function () {
        fakeRes.send();
        assert.strictEqual(fakeOut, '');
    });

    it('should handle a string', function () {
        fakeRes.send('The Walrus is Paul');
        assert.strictEqual(fakeOut, 'The Walrus is Paul');
    });

    it('should handle an object', function () {
        fakeRes.send(obj);
        assert.strictEqual(fakeOut, JSON.stringify(obj));
    });

    it('should handle an array', function () {
        fakeRes.send(['one', 'two']);
        assert.strictEqual(fakeOut, JSON.stringify(['one', 'two']));
    });

    it('should handle a number and other weird data', function () {
        fakeRes.send(1);
        assert.strictEqual(fakeOut, '1');
    });

    it('should handle a bool', function () {
        fakeRes.send(true);
        assert.strictEqual(fakeOut, JSON.stringify(true));
    });
});
