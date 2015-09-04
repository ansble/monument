// replacement for node's built-in 'url.parse' that safely removes the square brackets
// supports only parseQueryString = true therefore does not accept that argument
var url = require('url');

function parse(urlStr, slashesDenoteHost) {
	'use strict';

	var urlObject = url.parse(urlStr, true, slashesDenoteHost)
	    , query = urlObject.query
	    , tempQuery = {}
	    , newQuery = {};

	Object.keys(urlObject.query).forEach(function(key){
		var newKey = key.replace(/\[\]$/, '');

		// if our key does not have brackets and the same
		// key does not already exist on the tempQuery object
		if (newKey === key && typeof tempQuery[newKey] === 'undefined') {
			tempQuery[newKey] = query[key];
		}
		else {
			tempQuery[newKey] = [].concat(tempQuery[newKey], query[key]);
		}
	});

	// filter out undefinded from tempQuery arrays
	Object.keys(tempQuery).forEach(function(key){
		if (Array.isArray(tempQuery[key])){
			newQuery[key] = tempQuery[key].filter(function (element) {
				return typeof element !== 'undefined';
			});
		}
		else {
			newQuery[key] = tempQuery[key];
		}
	});

	urlObject.query = newQuery;
	return urlObject;
}

module.exports = parse;
