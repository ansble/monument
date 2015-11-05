/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , send = require('./send')
    , zlib = require('zlib')
    , etag = require('etag');

let fakeRes
    , fakeOut
    , fakeEncode
    , fakeHeaders
    , obj
    , buf;

describe('Send Tests', () => {
    beforeEach(() => {
        fakeHeaders = {};

        fakeRes = {
            setHeader: (key, value) => {
                fakeHeaders[key] = value;
            }
            , end: (data, encode) => {
                  fakeOut = data;
                  fakeEncode = encode;
              }
            , statusCode: 200
        };

        fakeRes.send = send({
            headers: {
                'accept-encoding': 'none'
                , 'if-none-match': ''
            }
        }, { compression: false });

        fakeRes.sendDeflate = send({
            headers: {
                'accept-encoding': 'deflate'
                , 'if-none-match': ''
            }
        }, { compression: 'deflate' });

        fakeRes.sendGzip = send({
            headers: {
                'accept-encoding': 'gzip'
                , 'if-none-match': ''
            }
        }, { compression: 'gzip' });

        fakeOut = '';

        obj = {
            title: 'Tom Sawyer'
            , Author: 'Samuel Langhorne Clemens'
        };

        buf = new Buffer('this is a buffer', 'utf8');

        fakeRes.sendEtag = send({
            headers: {
                'accept-encoding': 'none'
                , 'if-none-match': etag(JSON.stringify(obj))
            }
        }, { compression: false });
    });

    it('should be defined as a function', () => {
        assert.isFunction(send);
    });

    it('should return a function', () => {
        assert.isFunction(send({}, {}));
    });

    it('should handle an empty data object', () => {
        fakeRes.send();
        assert.strictEqual(fakeOut, '');
    });

    it('should handle a string', () => {
        fakeRes.send('The Walrus is Paul');
        assert.strictEqual(fakeOut, 'The Walrus is Paul');
    });

    it('should handle an object', () => {
        fakeRes.send(obj);
        assert.strictEqual(fakeOut, JSON.stringify(obj));
    });

    it('should handle a buffer', () => {
        fakeRes.send(buf);
        assert.strictEqual(fakeOut, 'this is a buffer');
    });

    it('should handle an array', () => {
        fakeRes.send([ 'one', 'two' ]);
        assert.strictEqual(fakeOut, JSON.stringify([ 'one', 'two' ]));
    });

    it('should handle a number and other weird data', () => {
        fakeRes.send(1);
        assert.strictEqual(fakeOut, '1');
    });

    it('should handle a bool', () => {
        fakeRes.send(true);
        assert.strictEqual(fakeOut, JSON.stringify(true));
    });

    it('should return deflate compressed results if deflate header is sent', () => {
        fakeRes.sendDeflate(obj);
        assert.strictEqual(JSON.stringify(fakeOut), JSON.stringify(zlib.deflateSync(JSON.stringify(obj))));
        assert.strictEqual(fakeHeaders['Content-Encoding'], 'deflate');
    });

    it('should return gzip compressed results if gzip header is sent', () => {
        fakeRes.sendGzip(obj);
        assert.strictEqual(JSON.stringify(fakeOut), JSON.stringify(zlib.gzipSync(JSON.stringify(obj))));
        assert.strictEqual(fakeHeaders['Content-Encoding'], 'gzip');
    });

    it('should return a 304 if the content has not changed', () => {
        fakeRes.sendEtag(obj);
        assert.strictEqual(fakeRes.statusCode, 304);
    });
});
