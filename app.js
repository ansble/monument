var routes = require('./routes.json')
	, http = require('http')

	//setup the routes
	, server = require('./routes/')(http, routes);

server.listen(3000, '127.0.0.1');
console.log('Server running at http://127.0.0.1:3000/');