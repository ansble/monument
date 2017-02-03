/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , statsd = require('./statsd');

describe('statsd Tests', () => {
    it('should return an object', () => {
        assert.isObject(statsd);
        assert.isFunction(statsd.create);
    });
});
