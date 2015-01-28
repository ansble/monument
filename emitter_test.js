var assert = require('chai').assert
	, emitter = require('./emitter');

describe('event module tests', function(){
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
	it('should have  an "listeners" function', function(){
		assert.isFunction(emitter.listeners);
	});
	it('should have  an "setMaxListeners" function', function(){
		assert.isFunction(emitter.setMaxListeners);
	});
	it('should have  an "addListener" function', function(){
		assert.isFunction(emitter.addListener);
	});
	// it('should have  an "listenerCount" function', function(){
	// 	assert.isFunction(emitter.listenerCount);
	// });
});