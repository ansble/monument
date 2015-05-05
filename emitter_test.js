var assert = require('chai').assert
	, emitter = require('./emitter')

    , test;

describe('Event Tests', function(){
	'use strict';

    beforeEach(function () {
        test = true;
    });

    afterEach(function () {
        emitter.off('some-event');
    });

	it('should have  an "on" function', function(){
		assert.isFunction(emitter.on);
	});

	it('should have  a "once" function', function(){
		assert.isFunction(emitter.once);
	});

	it('should have  an "removeListener" function', function(){
		assert.isFunction(emitter.removeListener);
	});

	it('should have  an "removeAllListeners" function', function(){
		assert.isFunction(emitter.removeAllListeners);
	});

	it('should have  an "emit" function', function(){
		assert.isFunction(emitter.emit);
	});

	describe('listeners function tests', function () {
        it('should have  an "listeners" function', function(){
            assert.isFunction(emitter.listeners);
        });

        it('should return an array of all listeners', function () {
            emitter.on('some-event', function () {
                test = false;
            });

            assert.isArray(emitter.listeners('some-event'));
            assert.lengthOf(emitter.listeners('some-event'), 1);
        });
    });

	it('should have  an "addListener" function', function(){
		assert.isFunction(emitter.addListener);
	});

	it('should have  a "required" function', function(){
		assert.isFunction(emitter.required);
	});


    describe('.off tests', function () {
        it('should have  an "off" function', function(){
            assert.isFunction(emitter.off);
        });

        it('should eliminate all listeners to an event when called without function', function (done) {
            emitter.on('some-event', function () {
                test = false;
            });

            emitter.off('some-event');

            emitter.emit('some-event');

            setTimeout(function () {
                assert.strictEqual(test, true);
                done();
            }, 1);
        });

    });

	// it('should have  an "listenerCount" function', function(){
	// 	assert.isFunction(emitter.listenerCount);
	// });
});
