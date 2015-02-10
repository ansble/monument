module.exports = function (data) {
	var type = typeof data
		, isBuffer = Buffer.isBuffer(data)
		, isHead = true //TODO: make this real... is req part of the res object? Or does it need to be passed in?
		, encoding = 'utf8';

	if (type === 'string') {
		this.setHeader('Content-Type', 'text/html');
		this.setEncoding(encoding); //encoding header for the response

		// data = new Buffer(data, encoding);
	// } else if (isBuffer) {
	// 	this.setHeader('Content-Type', 'application/octet-stream');
	// 	this.setEncoding('');
	} else if(typeof data === 'object'){
		//this is JSON send it and end it
		this.setHeader('Content-Type', 'application/json');
		if(!isBuffer){
			data = JSON.stringify(data);
		} else {
			this.setHeader('Content-Type', 'text/html');
			data = data.toString();
		}
	}

	return this.end(data, encoding);
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