var assert = require('chai').assert
  , parser = require('./parser')

  , httpMocks = require('node-mocks-http');

describe('Parser Tests', function () {
  'use strict';

  it('should return a function', function () {
    assert.isFunction(parser);
  });

  it('should parse out a form submission');
  it('should parse out a json post/put/update');
  it('should place the parsed elements in body', function () {
  	var temp = {
	  		name: 'Eddy Merckx'
	  		, title: 'The Cannibal'
	  	}
	  	, connection = {
	  		req: httpMocks.createRequest({
	  			method: 'POST'
	  			, url: '/some-url'
	  			, params: {}
	  			, body: temp
	  			, headers: {
	  				'content-type': 'application/json'
	  			}
	  		})
	  		, res: httpMocks.createResponse()
	  		, params: {}
	  		, query: {}
	  	};

  	parser(connection, function (body) {
  		assert.isObject(body);
  		assert.strictEqual(body.name, temp.name);
  		assert.strictEqual(body.tile, temp.title);
  	});
  });
});
