var path = require('path')
	, normalizedPath = path.join(__dirname)
	, fs = require('fs')
	, http = require('http')
	, emitter = require('../emitter.js')

	, server;

//load in all the route handlers
fs.readdirSync(normalizedPath).forEach(function(file) {
  if(file !== 'index.js'){
  	require("./" + file);
  }
});


server = function(serverType, routesJson){

	return serverType.createServer(function (req, res) {

		if(routesJson[req.url] && routesJson[req.url].indexOf(req.method.toLowerCase()) !== -1){
			emitter.emit('route:' + req.url + ':' + req.method.toLowerCase(), {req: req, res: res});
		} else {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('Route not found');
		}
	});
}

module.exports = server;