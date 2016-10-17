/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , setStatus = require('./setStatus')
    , fakeResFilled = {
        statusCode: 404
        , statusMessage: 'Not Found'
        , setStatus: setStatus()
    };

let fakeRes;

describe('setStatus function of response object', () => {
    beforeEach(() => {
        fakeRes = {};
        fakeRes.setStatus = setStatus();
    });

    it('should be defined as a function', () => {
        assert.isFunction(setStatus);
    });
    it('should return a function', () => {
        assert.isFunction(setStatus());
    });

    it('should set data by a string that is an http status message', () => {
        fakeRes.setStatus('Not Found');
        assert.strictEqual(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled));
    });
    it('should set data by a number that is an http status code', () => {
        fakeRes.setStatus(404);
        assert.strictEqual(JSON.stringify(fakeRes), JSON.stringify(fakeResFilled));
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
});