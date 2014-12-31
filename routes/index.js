var path = require('path')
	, normalizedPath = path.join(__dirname)
	, fs = require('fs')
	, http = require('http')
	, emitter = require('../emitter.js')

	, mimetype = require('../mimetype.js')

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
				wildCardRoutes[route] = {
											verbs: routes[route]
											, variables: routeVariables
											, eventId: route
											, regex: new RegExp(route.replace(/:[a-zA-Z]+/g, '([^\/]+)'))
										};
			} else {
				standardRoutes[route] = routes[route];
			}
		});

		return {wildcard: wildCardRoutes, standard: standardRoutes};
	}

	, isRoute = function (req, routesJson) {
		return !!(routesJson[req.url] && routesJson[req.url].indexOf(req.method.toLowerCase()) !== -1);
	}

	, isWildCardRoute = function (req, routesJson) {
		var matchedRoutes = Object.keys(routesJson).filter(function (route) {
					return !!(req.url.match(routesJson[route].regex));
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
				return !!(req.url.match(routesJson[route].regex));
			})[0]

			, matches = req.url.match(routesJson[matchedRoute].regex)			
			, values = {}
			, routeInfo = routesJson[matchedRoute];

		for(i = 0; i < routeInfo.variables.length; i++){
			values[routeInfo.variables[i].substring(1)] = matches[i + 1]; //offset by one to avoid the whole match which is at array[0]
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
	//TODO: queryparam parsing needed!
	return serverType.createServer(function (req, res) {
		var method = req.method.toLowerCase()
			, connection = {req: req, res: res};

		//match the first part of the url... for public stuff
		if (publicFolders.indexOf(req.url.split('/')[1]) !== -1) {
			//static assets y'all
			//read in the file and stream it to the client
			fs.exists('./public' + req.url, function (exists) {
				if(exists){
					//return with the correct heders for the file type
					res.writeHead(200, {'Content-Type': mimetype(req.url.split('.').pop())});
					fs.createReadStream('./public' + req.url).pipe(res);
					emitter.emit('static:served', req.url);
				} else {
					emitter.emit('static:missing', req.url);
					emitter.emit('error:404', connection);
				}
			});
		} else if (isRoute(req, routesObj.standard)) {
			//matches a route in the routes.json
			emitter.emit('route:' + req.url + ':' + method, connection);

		} else if (isWildCardRoute(req, routesObj.wildcard)) {
			var routeInfo = parseWildCardRoute(req, routesObj.wildcard);

			req.params = routeInfo.values;
			
			//emit the event for the url minus params and include the params
			//	in the req.params object
			emitter.emit('route:' + routeInfo.route.eventId + ':' + method, connection);
		} else {
			emitter.emit('error:404', connection);
		}
	});
}

module.exports = server;
