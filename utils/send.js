module.exports = function (data) {
	var type = typeof data
		, isBuffer = Buffer.isBuffer(data)
		, isHead = true //TODO: make this real... is req part of the res object? Or does it need to be passed in?
		, encoding;
	//   switch (typeof chunk) {
	//     // string defaulting to html
	//     case 'string':
	//       if (!this.get('Content-Type')) {
	//         this.type('html'); TODO: What is this.type???
	//       }
	//       break;
	//     case 'boolean':
	//     case 'number':
	//     case 'object':
	//       if (chunk === null) {
	//         chunk = '';
	//       } else if (Buffer.isBuffer(chunk)) {
	//         if (!this.get('Content-Type')) {
	//           this.type('bin'); TODO: What is this.type???
	//         }
	//       } else {
	//         return this.json(chunk);
	//       }
	//       break;
	//   }

	if (type === 'string') {
		//   // write strings in utf-8
		//   if (typeof chunk === 'string') {
		//     encoding = 'utf8';
		//     type = this.get('Content-Type');

		//     // reflect this in content-type
		//     if (typeof type === 'string') {
		//       this.set('Content-Type', setCharset(type, 'utf-8')); TODO: What does this do??
		//     }
		//   }
		this.setHeader('Content-Type', 'text/html');
		this.setEncoding('utf8'); //encoding header for the response
		encoding = 'utf8'; //encoding for sending the data
		data = new Buffer(data, encoding);
	} else if (isBuffer) {
		this.setHeader('Content-Type', 'application/octet-stream');
		this.setEncoding('')
	} else {
		//this is JSON send it and end it
		this.setHeader('Content-Type', 'application/json');
		return this.end(JSON.stringify(data), 'utf8');
	}

	if (type !== 'undefined') {
		this.setHeader('Content-Length', data.length);
	}
	
	//   // freshness
	//   if (req.fresh) this.statusCode = 304;

	//   // strip irrelevant headers
	//   if (204 == this.statusCode || 304 == this.statusCode) {
	//     this.removeHeader('Content-Type');
	//     this.removeHeader('Content-Length');
	//     this.removeHeader('Transfer-Encoding');
	//     chunk = '';
	//   }

	if(isHead){
		this.end();
	} else {
		this.end(data, encoding); //TODO: get the encoding set somewhere...
	}
};