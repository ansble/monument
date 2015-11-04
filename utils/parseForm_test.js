/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , parseForm = require('./parseForm')
    , validString = '------WebKitFormBoundary13WN3NA3Cv1LBWIx\nContent-Disposition: form-data; name="name"\n\ndaniel\n------WebKitFormBoundary13WN3NA3Cv1LBWIx\nContent-Disposition: form-data; name="title"\n\nlord of the interwebz\n------WebKitFormBoundary13WN3NA3Cv1LBWIx--\n';

describe('parseForm Tests', () => {
    it('should return a function ', () => {
        assert.isFunction(parseForm);
    });

    it('should parse a form string out correctly', () => {
        assert.isObject(parseForm(validString));
        assert.strictEqual(parseForm(validString).name, 'daniel');
        assert.strictEqual(parseForm(validString).title, 'lord of the interwebz');
    });

    it('should return an empty object if no form string', () => {
        assert.isObject(parseForm('this is bogus'));
        assert.strictEqual(Object.keys(parseForm('this is something')).length, 0);
    });
});
