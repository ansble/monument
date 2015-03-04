var path = require('path')
	, fs = require('fs')
	, zlib = require('zlib')
	, events = require('../emitter')
	, url = require('url')
	, send = require('../utils/send')
	, mime = require('mime')

	, publicFolders = []

	, server

	, parsePath = function (urlIn) {
		'use strict';

		return url.parse(urlIn, true);
	}

	, parseRoutes = function (routes) {
		'use strict';

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
											, regex: new RegExp('^' + route.replace(/:[a-zA-Z]+/g, '([^\/]+)') + '$')
										};
			} else {
				standardRoutes[route] = routes[route];
			}
		});

		return {wildcard: wildCardRoutes, standard: standardRoutes};
	}

	, isRoute = function (pathname, method, routesJson) {
		'use strict';

		var pathString
			, route;

		if(pathname.slice(-1) === '/'){
			pathString = pathname.replace(/\/$/,'');
		} else {
			pathString = pathname + '/';
		}

		if(routesJson[pathname] && routesJson[pathname].indexOf(method) !== -1){
			route = pathname;
		} else if (routesJson[pathString] && routesJson[pathString].indexOf(method) !== -1){
			route = pathString;
		} else {
			route = null;
		}

		return route;
	}

	, isWildCardRoute = function (pathname, method, routesJson) {
		'use strict';

		var matchedRoutes = Object.keys(routesJson).filter(function (route) {
					return !!(pathname.match(routesJson[route].regex));
				})
			, matchesVerb;

		if(matchedRoutes.length){
			matchesVerb = routesJson[matchedRoutes[0]].verbs.indexOf(method) !== -1;
		} else {
			matchesVerb = false;
		}

		return matchedRoutes.length > 0 && matchesVerb;
	}

	, parseWildCardRoute = function (pathname, routesJson) {
		'use strict';

		var matchedRoute = Object.keys(routesJson).filter(function (route) {
				return !!(pathname.match(routesJson[route].regex));
			})[0]

			, matches = pathname.match(routesJson[matchedRoute].regex)			
			, values = {}
			, routeInfo = routesJson[matchedRoute]
			, i = 0;

		for(i = 0; i < routeInfo.variables.length; i++){
			values[routeInfo.variables[i].substring(1)] = matches[i + 1]; //offset by one to avoid the whole match which is at array[0]
		}

		return {route: routeInfo, values: values};
	}

	, setupStaticRoutes = function (routePathIn, publicPathIn) {
		'use strict';

		var routePath = path.join(process.cwd(), routePathIn)
			, publicPath = publicPathIn;

		//load in all the route handlers
		fs.readdirSync(routePath).forEach(function (file) {
			if(file !== 'index.js'){
				require(path.join(routePath, file));
			}
		});

		//load in all the static routes
		fs.exists(publicPath, function (exists) {
			if(exists){
				fs.readdirSync(publicPath).forEach(function (file) {
					publicFolders.push(file);
				});
			}
		});
	}

	, getCompression = function (header, config) {
		'use strict';

		var type = ''
			, typeArray = header.split(', ')
			, maxq = 0;

		if(typeof config.compress !== 'undefined' && !config.compress){
			// compression turned off... bail
			return 'none';
		}

		if(header.match(/q=/)){
			//we have q values to calculate
			typeArray.forEach(function (qIn) {
				var q = parseFloat(qIn.match('/[0-9]\.[0-9]/')[0], 10);

				if(q > maxq){
					maxq = q;
					type = q.split(';')[0];
				}
			});
		} else {
			if (header.match(/\bgzip\b/)) {
			    type = 'gzip';
			} else if (header.match(/\bdeflate\b/)) {
			    type = 'deflate';
			} else {
			    type = 'none';
			}
		}

		return type;
	};


server = function (serverType, routesJson, config) {
	'use strict';

	var routesObj = parseRoutes(routesJson)
		, publicPath = path.join(process.cwd(), config.publicPath || './public')
		, maxAge = config.maxAge || 31536000
		, routeJSONPath = config.routesPath || '/routes';

	setupStaticRoutes(config.routePath, publicPath);

	return serverType.createServer(function (req, res) {		
		var method = req.method.toLowerCase()
			, pathParsed = parsePath(req.url)
			, pathname = pathParsed.pathname
			, compression
			, file
			, simpleRoute = isRoute(pathname, method, routesObj.standard)
			, connection = {
							req: req
							, res: res
							, query: pathParsed.query
							, params: {}
						};

		//add .send to the response
		res.send = send(req);

		//match the first part of the url... for public stuff
		if (publicFolders.indexOf(pathname.split('/')[1]) !== -1) {
			//static assets y'all
			file = path.join(publicPath, pathname);
			//read in the file and stream it to the client
			fs.exists(file, function (exists) {
				if(exists){
					events.required(['etag:check:' + file, 'etag:get:' + file], function (valid) {
						if(valid[0]){ // does the etag match? YES
							res.statusCode = 304;
							res.end();
						} else { //No match...
							res.setHeader('ETag', valid[1]); //the etag is item 2 in the array

							compression = getCompression(req.headers['accept-encoding'], config);

							if(compression !== 'none'){
								//we have compression!
								res.writeHead(200, {
									'Content-Type': mime.lookup(pathname),
									'Cache-Control': 'maxage=' + maxAge,
									'Content-Encoding': compression
								});

								if(compression === 'deflate'){
									fs.exists(file + '.def', function(exists){
										if(exists){
											fs.createReadStream(file + '.def').pipe(res);
										} else {
											//no compressed file yet...
											fs.createReadStream(file).pipe(zlib.createDeflate()).pipe(res);
											fs.createReadStream(file).pipe(zlib.createDeflate()).pipe(fs.createWriteStream(file + '.def'));
										}
									});
								} else if(compression !== 'none'){
									fs.exists(file + '.tgz', function(exists){
										if(exists){
											fs.createReadStream(file + '.tgz').pipe(res);
										} else {
											//no compressed file yet...
											fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res);
											fs.createReadStream(file).pipe(zlib.createGzip()).pipe(fs.createWriteStream(file + '.tgz'));
										}
									});
								}

								events.emit('static:served', pathname);

							} else {
								//no compression carry on...
								//return with the correct heders for the file type
								res.writeHead(200, {
									'Content-Type': mime.lookup(pathname),
									'Cache-Control': 'maxage=' + maxAge
								});
								fs.createReadStream(file).pipe(res);
								events.emit('static:served', pathname);
							}
						}
					});

					events.emit('etag:check', {file: file, etag: req.headers['if-none-match']});

				} else {
					events.emit('static:missing', pathname);
					events.emit('error:404', connection);
				}
			});
		} else if (simpleRoute !== null) {
			//matches a route in the routes.json
			events.emit('route:' + simpleRoute + ':' + method, connection);

		} else if (isWildCardRoute(pathname, method, routesObj.wildcard)) {
			var routeInfo = parseWildCardRoute(pathname, routesObj.wildcard);
			
			connection.params = routeInfo.values;
			
			//emit the event for the url minus params and include the params
			//	in the params object
			events.emit('route:' + routeInfo.route.eventId + ':' + method, connection);
		} else if(pathname === routeJSONPath){
			res.writeHead(200, {
				'Content-Type': mime.lookup('routes.json')
			});
			fs.createReadStream(path.join(process.cwd(), './routes.json')).pipe(res);
		} else {
			events.emit('error:404', connection);
		}
	});
};

module.exports = {
					server: server
					, parseWildCardRoute: parseWildCardRoute
					, isWildCardRoute: isWildCardRoute
					, parseRoutes: parseRoutes
					, parsePath: parsePath
				};
