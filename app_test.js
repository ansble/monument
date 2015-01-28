var assert = require('chai').assert
	, app = require('./app')
	Events = require('events').EventEmitter;

describe('The main monument tests', function(){
	it('should be correctly defined', function(){
		assert.isFunction(app.server);
		assert.isFunction(app.parser);
		assert.instanceOf(app.events, Events);
	});

	describe('Parser Tests', function(){
		it('should have a parser method', function(){
			assert.isFunction(app.parser);
		});
	});
});