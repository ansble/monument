var etag = require('etag');

module.exports = function(req){
	'use strict';
	
	return function (data) {
		var that = this
			, type = typeof data
			, isBuffer = Buffer.isBuffer(data)
			, encoding = 'utf8'
			, reqEtag;

		if (type === 'string') {
			that.setHeader('Content-Type', 'text/html');
			// that.setEncoding(encoding); //encoding header for the response

			// data = new Buffer(data, encoding);
		// } else if (isBuffer) {
		// 	that.setHeader('Content-Type', 'application/octet-stream');
		// 	that.setEncoding('');
		} else if(typeof data === 'object'){
			//this is JSON send it and end it
			that.setHeader('Content-Type', 'application/json');
			if(!isBuffer){
				data = JSON.stringify(data);

			} else {
				that.setHeader('Content-Type', 'text/html');
				data = data.toString();
			}
		}

		reqEtag = etag(data);

		if(req.headers['if-none-match'] === reqEtag){
			that.statusCode = 304;
			that.end();
		} else {
			that.setHeader('ETag', reqEtag);
			that.end(data, encoding);
		}

		// if (type !== 'undefined') {
		// 	this.setHeader('Content-Length', data.length);
		// }
		
		// //   // freshness
		// //   if (req.fresh) this.statusCode = 304;

		// //   // strip irrelevant headers
		// //   if (204 == this.statusCode || 304 == this.statusCode) {
		// //     this.removeHeader('Content-Type');
		// //     this.removeHeader('Content-Length');
		// //     this.removeHeader('Transfer-Encoding');
		// //     chunk = '';
		// //   }

		// if(isHead){
		// 	this.end();
		// } else {
		// 	this.end(data, encoding); //TODO: get the encoding set somewhere...
		// }
	};	
};
