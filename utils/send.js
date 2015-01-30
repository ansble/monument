method.exports = function (data) {
	var type = typeof data;

	if (type === 'string') {
		this.setHeader('Content-Type', 'text/html');
		this.end(data);
	} else if (type === 'object') {
		if (Buffer.isBuffer(data)) {
			this.setHeader('Content-Type', 'application/octet-stream');
		} else {
			this.setHeader('Content-Type', 'application/json');
		}
		this.end(data);
	}
};

// res.send = function send(body) {
//   var chunk = body;
//   var encoding;
//   var len;
//   var req = this.req;
//   var type;

//   switch (typeof chunk) {
//     // string defaulting to html
//     case 'string':
//       if (!this.get('Content-Type')) {
//         this.type('html');
//       }
//       break;
//     case 'boolean':
//     case 'number':
//     case 'object':
//       if (chunk === null) {
//         chunk = '';
//       } else if (Buffer.isBuffer(chunk)) {
//         if (!this.get('Content-Type')) {
//           this.type('bin');
//         }
//       } else {
//         return this.json(chunk);
//       }
//       break;
//   }

//   // write strings in utf-8
//   if (typeof chunk === 'string') {
//     encoding = 'utf8';
//     type = this.get('Content-Type');

//     // reflect this in content-type
//     if (typeof type === 'string') {
//       this.set('Content-Type', setCharset(type, 'utf-8'));
//     }
//   }

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

//   return this;
// };