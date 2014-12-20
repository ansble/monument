var path = require('path')
	, normalizedPath = path.join(__dirname)
	, fs = require('fs')
	, http = require('http')
	, emitter = require('../emitter.js')

	, publicFolders = []

	, server;

//load in all the route handlers
fs.readdirSync(normalizedPath).forEach(function (file) {
	if(file !== 'index.js'){
		require("./" + file);
	}
});

//load in all the static routes
fs.readdirSync('./public').forEach(function (file) {
	if(fs.statSync('./public/' + file).isDirectory()){
		publicFolders.push(file);
	}
});

server = function (serverType, routesJson) {
	return serverType.createServer(function (req, res) {
		//match the first part of the url... for public stuff
		if (publicFolders.indexOf(req.url.split('/')[1]) !== -1) {
			//static assets y'all
			//read in the file and stream it to the client
			fs.exists('./public' + req.url, function (exists) {
				if(exists){
					fs.createReadStream('./public' + req.url).pipe(res);
				} else {
					//replace with the error route
					res.writeHead(404, {'Content-Type': 'text/plain'});
					res.end('file not found');
				}
			});
		} else if (routesJson[req.url] && routesJson[req.url].indexOf(req.method.toLowerCase()) !== -1) {
			//matches a route in the routes.json
			emitter.emit('route:' + req.url + ':' + req.method.toLowerCase(), {req: req, res: res});
		} else {
			//todo replace with the error route...
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('file not found');
		}
	});
}

module.exports = server;