var assert = require('chai').assert
	, server = require('./index')
	, Events = require('events').EventEmitter;

describe('Routing Tests', function () {
	it('should return a function that starts a server', function () {
		assert.isFunction(server.server);
	});

	it('should have a parseWildCardRoute function', function () {
		assert.isFunction(server.parseWildCardRoute);
	});

	it('should have a isWildCardRoute function', function () {
		assert.isFunction(server.isWildCardRoute);
	});

	it('should have a parseRoutes function', function () {
		assert.isFunction(server.parseRoutes);
	});

	it('should have a parsePath function', function () {
		assert.isFunction(server.parsePath);
	});
});