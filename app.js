var routes = require('./routes.json')
	, http = require('http')
	, port = process.env.PORT || 3000

	//setup the routes and server
	//	pass in the http or https object and the routes.json
	//	then listen below on port/address you want to
	, server = require('./routes/')(http, routes);

server.listen(port);
console.log('Server running at http://127.0.0.1:' + port + '/');