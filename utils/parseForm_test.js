/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , parseForm = require('./parseForm')
    , fs = require('fs')
    , path = require('path')
    , fileToRead = path.join(process.cwd(), '/test_stubs/formDataBody.txt')
    , validString = fs.readFileSync(fileToRead, 'utf-8');

describe('parseForm Tests', () => {
    it('should return a function ', () => {
        assert.isFunction(parseForm);
    });

    it('should parse a form string out correctly', () => {
        console.log(validString);
        assert.isObject(parseForm(validString));
        assert.strictEqual(parseForm(validString).name, 'daniel');
        assert.strictEqual(parseForm(validString).title, 'lord of the interwebz');
    });

    it('should return an empty object if no form string', () => {
        assert.isObject(parseForm('this is bogus'));
        assert.strictEqual(Object.keys(parseForm('this is something')).length, 0);
    });
});
