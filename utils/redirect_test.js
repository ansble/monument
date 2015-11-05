/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , redirect = require('./redirect')
    , events = require('harken');

let fakeRes
    , fakeOut
    , fakeHeaders
    , fakeHead;

describe('Redirect Tests', () => {
    beforeEach(() => {
        fakeHeaders = {};

        fakeRes = {
            setHeader: (key, value) => {
                fakeHeaders[key] = value;
            }
            , end: (data) => {
                  fakeOut = data;
              }
            , statusCode: 200
        };

        fakeHead = {
            setHeader: (key, value) => {
                fakeHeaders[key] = value;
            }
            , end: (data) => {
                  fakeOut = data;
              }
            , statusCode: 200
        };

        fakeRes.redirect = redirect({
            headers: {
                'accept-encoding': 'none'
                , 'if-none-match': ''
            }
        });

        fakeHead.redirect = redirect({
            headers: {
                'accept-encoding': 'none'
                , 'if-none-match': ''
            }
            , method: 'HEAD'
        });

        fakeOut = '';
    });

    it('should be defined as a function', () => {
        assert.isFunction(redirect);
    });

    it('should return a function', () => {
        assert.isFunction(redirect({}));
    });

    it('should raise a 500 error event if no url is passed', (done) => {
        events.once('error:500', (msg) => {
            assert.isDefined(msg);
            done();
        });

        fakeRes.redirect();
    });

    it('should default to 307 for just an url passed', () => {
        fakeRes.redirect('www.google.com');
        assert.strictEqual(fakeOut, '307 Temporary Redirect to www.google.com');
        assert.strictEqual(fakeHeaders.location, 'www.google.com');
        assert.strictEqual(fakeRes.statusCode, 307);
    });

    it('should allow a statusCode to be passed in', () => {
        fakeRes.redirect('www.google.com', 302);
        assert.strictEqual(fakeOut, '302 Found to www.google.com');
        assert.strictEqual(fakeHeaders.location, 'www.google.com');
        assert.strictEqual(fakeRes.statusCode, 302);
    });

    it('should return an empty body if \'HEAD\' request and specified type', () => {
        fakeHead.redirect('www.google.com', 302);
        assert.strictEqual(fakeOut, undefined);
        assert.strictEqual(fakeHeaders.location, 'www.google.com');
        assert.strictEqual(fakeHead.statusCode, 302);
    });

    it('should return an empty body if \'HEAD\' request and no type', () => {
        fakeHead.redirect('www.google.com');
        assert.strictEqual(fakeOut, undefined);
        assert.strictEqual(fakeHeaders.location, 'www.google.com');
        assert.strictEqual(fakeHead.statusCode, 307);
    });
});
