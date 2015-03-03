var assert = require('chai').assert
	, app = require('./app')
	, Events = require('events').EventEmitter;

describe('The main monument tests', function(){
	it('should be correctly defined', function(){
		assert.isFunction(app.server);
		assert.isFunction(app.parser);
		// assert.instanceOf(app.events, Events);
	});

	describe('Parser Tests', function(){
		it('should have a parser method', function(){
			assert.isFunction(app.parser);
		});

		it('should parse out a form submission');
		it('should parse out a json post/put/update');
		it('should place the parsed elements in req.body');
	});

	describe('Wrapper Tests', function () {
		it('should return a server when run');
	});

	describe('Emitter Tests', function () {
		it('should be an instance of the Events', function () {
			// assert.instanceOf(app.events, Events);
		});
	});

	describe('Compression Tests', function () {
		it('should compress things by default');
		it('should not compress things if compression is turned off');
	});
});