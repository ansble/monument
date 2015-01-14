var routes = require('./routes.json')
	, http = require('http')

	//setup the routes and server
	//	pass in the http or https object and the routes.json
	//	then listen below on port/address you want to
	, server

	, wrapper = function (config) {
		var port = config.port || 3000;

		server = require('./routes/index.js')(http, routes, config.routePath);

		server.listen(port);

		console.log('monumentjs running at http://127.0.0.1:' + port + '/');
	};

module.exports = {server: wrapper};