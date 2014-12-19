var routes = require('./routes.json')
	, emitter = require('./emitter.js')
	, http = require('http');

//setup the routes
require('./routes/');

http.createServer(function (req, res) {

	if(routes[req.url] && routes[req.url].indexOf(req.method.toLowerCase()) !== -1){
		emitter.emit('route:' + req.url + ':' + req.method.toLowerCase(), {req: req, res: res});
	} else {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.end('Route not found');
	}
}).listen(3000, '127.0.0.1');
console.log('Server running at http://127.0.0.1:3000/');