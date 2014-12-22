var path = require('path')
	, normalizedPath = path.join(__dirname)
	, fs = require('fs')
	, http = require('http')
	, emitter = require('../emitter.js')

	, publicFolders = []

	, server

	, parseRoutes = function (routes) {
		var wildCardRoutes = {}
			, standardRoutes = {};

		Object.keys(routes).forEach(function (route) {
			var routeVariables = route.match(/:[a-zA-Z]+/g);

			if(routeVariables){
				//generate the regex for laters and
				//	store the verbs and variables belonging to the route
				wildCardRoutes[route.replace(/:[a-zA-Z]+/g, '([^\/]+)')] = {verbs: routes[route], variables:routeVariables, eventId: route};
			} else {
				standardRoutes[route] = routes[route];
			}
		});

		return {wildcard: wildCardRoutes, standard: standardRoutes};
	}

	, isRoute = function (req, routesJson) {
		return routesJson[req.url] && routesJson[req.url].indexOf(req.method.toLowerCase()) !== -1;
	}

	, isWildCardRoute = function (req, routesJson) {
		var matchedRoutes = Object.keys(routesJson).filter(function (route) {
					var routeRegex = new RegExp(route);
					return !!(req.url.match(routeRegex));
				})
			, matchesVerb;

		if(matchedRoutes.length){
			matchesVerb = routesJson[matchedRoutes[0]].verbs.indexOf(req.method.toLowerCase()) !== -1
		} else {
			matchesVerb = false;
		}

		return matchedRoutes.length > 0 && matchesVerb;
	}

	, parseWildCardRoute = function (req, routesJson) {
		var matchedRoute = Object.keys(routesJson).filter(function (route) {
				var routeRegex = new RegExp(route);
				return !!(req.url.match(routeRegex));
			})[0]

			, routeRegex = new RegExp(matchedRoute)
			, matches = req.url.match(routeRegex)
			
			, values = {}
			, routeInfo = routesJson[matchedRoute];

		matches.shift();

		for(i = 0; i < routeInfo.variables.length; i++){
			values[routeInfo.variables[i].substring(1)] = matches[i];
		}

		return {route: routeInfo, values: values};
	};

//load in all the route handlers
fs.readdirSync(normalizedPath).forEach(function (file) {
	if(file !== 'index.js'){
		require("./" + file);
	}
});

//load in all the static routes
fs.exists('./public', function () {
	fs.readdirSync('./public').forEach(function (file) {
		if(fs.statSync('./public/' + file).isDirectory()){
			publicFolders.push(file);
		}
	});
});

server = function (serverType, routesJson) {
	var routesObj = parseRoutes(routesJson);

	return serverType.createServer(function (req, res) {
		//match the first part of the url... for public stuff
		if (publicFolders.indexOf(req.url.split('/')[1]) !== -1) {
			//static assets y'all
			//read in the file and stream it to the client
			fs.exists('./public' + req.url, function (exists) {
				if(exists){
					fs.createReadStream('./public' + req.url).pipe(res);
					emitter.emit('static:served', req.url);
				} else {
					emitter.emit('static:missing', req.url);
					//replace with the error route
					res.writeHead(404, {'Content-Type': 'text/plain'});
					res.end('file not found');
				}
			});
		} else if (isRoute(req, routesObj.standard)) {
			//matches a route in the routes.json
			emitter.emit('route:' + req.url + ':' + req.method.toLowerCase(), {req: req, res: res});

		} else if (isWildCardRoute(req, routesObj.wildcard)) {
			var routeInfo = parseWildCardRoute(req, routesObj.wildcard);

			req.params = routeInfo.values;
			
			//emit the event for the url minus params and include the params
			//	in the req.params object
			emitter.emit('route:' + routeInfo.route.eventId + ':' + req.method.toLowerCase(), {req: req, res: res});
		} else {
			//todo replace with the error route...
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('file not found');
		}
	});
}

module.exports = server;
