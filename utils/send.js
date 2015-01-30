method.exports = function (data) {
	var type = typeof data
		, isBuffer = Buffer.isBuffer(data);

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
	//         return this.json(chunk); TODO: What is this.json???
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
		this.setEncoding('utf8');
		this.end(data);
	} else if (type === 'object' || type === 'number' || type === 'boolean') {
		if (isBuffer) {
			this.setHeader('Content-Type', 'application/octet-stream');
		} else {
			this.setHeader('Content-Type', 'application/json');
		}
		this.end(data);
	}

	if (type !== 'undefined') {
		//   // populate Content-Length
		//   if (chunk !== undefined) {
		//     if (!Buffer.isBuffer(chunk)) {
		//       // convert chunk to Buffer; saves later double conversions
		//       chunk = new Buffer(chunk, encoding);
		//       encoding = undefined;
		//     }

		//     len = chunk.length;
		//     this.set('Content-Length', len);
		//   }
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

	//   if (req.method === 'HEAD') {
	//     // skip body for HEAD
	//     this.end();
	//   } else {
	//     // respond
	//     this.end(chunk, encoding);
	//   }
};