'use strict';

const assert = require('chai').assert
    , tools = require('./index')
    , Events = require('events')
    , emitter = new Events()
    , on = () => {}
    , one = () => {}
    , addListener = () => {};

describe('Tools tests', () => {


    it('should return an object of functions', () => {
        assert.isObject(tools);
        assert.isFunction(tools.flatten);
        assert.isFunction(tools.getListener);
    });

    it('should flatten an array of arrays', () => {
        const test = tools.flatten(['this', 'is', ['a', 'string', ['in', ['arrays']]]]);
        
        test.forEach((item) => {
            assert.isNotArray(item);
        });

        assert.isArray(test);
    });

    describe('getListener Tests', () => {
        it('should return .on if multiple is passed', () => {
            const test = tools.getListener(emitter, true);

            assert.strictEqual(test, emitter.on);
        });

        it('should return .addListener if multiple is passed and no .on', () => {
            const test = tools.getListener({
                addListener: addListener
            }, true);

            assert.strictEqual(test, addListener);
        });

        it('should return .once if available and multiple=false is passed', () => {
            const test = tools.getListener(emitter, false);

            assert.strictEqual(test, emitter.once);
        });

        it('should return .once if available and nothing passed for multiple', () => {
            const test = tools.getListener(emitter);
            
            assert.strictEqual(test, emitter.once);
        });

        it('should return .one if there is no .once', () => {
            const test = tools.getListener({
                one: one
            });

            assert.strictEqual(one, test);
        });

        it('should return .on if no .once or .one', () => {
            const test = tools.getListener({
                on: on
            });

            assert.strictEqual(on, test);
        });

        it('sohuld return .addListener if no .once, .one, or .on', () => {
            const test = tools.getListener({
                addListener: addListener
            });

            assert.strictEqual(addListener, test);
        });
    });
});
