/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , setStatus = require('./setStatus')
    , fakeResFilled404 = {
        statusCode: 404
        , statusMessage: 'Not Found'
        , setStatus: setStatus
    }
    , fakeResFilled400 = {
        statusCode: 400
        , statusMessage: 'Bad Request'
        , setStatus: setStatus
    }
    , fakeResFilled500 = {
        statusCode: 500
        , statusMessage: 'Internal Server Error'
        , setStatus: setStatus
    };

let fakeRes;

describe('setStatus function of response object', () => {
    beforeEach(() => {
        fakeRes = {
            setStatus: setStatus
        };
    });

    it('should be defined as a function', () => {
        assert.isFunction(fakeRes.setStatus);
    });
    it('should return a boolean', () => {
        assert.isBoolean(fakeRes.setStatus());
    });

    it('should set data by a string that is an http status message', () => {
        fakeRes.setStatus('Not Found');
        assert.strictEqual(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled404));
    });
    it('should set data by a number that is an http status code', () => {
        fakeRes.setStatus(404);
        assert.strictEqual(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled404));
    });
    it('should not set data by a string that is not http status message', () => {
        fakeRes.setStatus('Testing Not Found');
        assert.strictEqual(JSON.stringify(fakeRes), JSON.stringify({}));
    });
    it('should not set data by a number that is not http status code', () => {
        fakeRes.setStatus(4040);
        assert.strictEqual(JSON.stringify(fakeRes), JSON.stringify({}));
    });




    it('should return true if values are set by status message string', () => {
        assert.strictEqual(fakeRes.setStatus('Not Found'), true);
    });
    it('should return true if values are set by status message code', () => {
        assert.strictEqual(fakeRes.setStatus(404), true);
    });
    it('should return false if values are set by status message string', () => {
        assert.strictEqual(fakeRes.setStatus('Testing Not Found'), false);
    });
    it('should return false if values are set by status message code', () => {
        assert.strictEqual(fakeRes.setStatus(4040), false);
    });

    it('should return true for string "Bad Request"', () => {
        assert.strictEqual(fakeRes.setStatus('Bad Request'), true);
    });
    it('should return true for status code 400', () => {
        assert.strictEqual(fakeRes.setStatus(400), true);
    });
    it('should set data for string "Bad Request"', () => {
        fakeRes.setStatus('Bad Request');
        assert.strictEqual(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled400));
    });
    it('should set data for status code 400', () => {
        fakeRes.setStatus(400);
        assert.strictEqual(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled400));
    });

    it('should return true for string "Internal Server Error"', () => {
        assert.strictEqual(fakeRes.setStatus('Internal Server Error'), true);
    });
    it('should return true for status code 500', () => {
        assert.strictEqual(fakeRes.setStatus(500), true);
    });
    it('should set data for string "Internal Server Error"', () => {
        fakeRes.setStatus('Internal Server Error');
        assert.strictEqual(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled500));
    });
    it('should set data for status code 500', () => {
        fakeRes.setStatus(500);
        assert.strictEqual(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled500));
    });
});