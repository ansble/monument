var routes = require('./routes.json')
	, http = require('http')

	, pkg = require('./package.json')

	//setup the routes and server
	//	pass in the http or https object and the routes.json
	//	then listen below on port/address you want to
	, server

	, wrapper = function (config) {
		var port = config.port || 3000;

		server = require('./routes/index.js')(http, routes, config);

		server.listen(port);

		console.log('monumentjs v' + pkg.version +' up and running on port: ' + port);
	};

module.exports = {server: wrapper, events: require('../emitter.js')};