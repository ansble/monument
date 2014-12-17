var utils = require('./util.js'),


	expandRoutes = function (routes) {
		var base = routes.base || '',
			expandedRoutes = {};

		if (Object.typeOf(routes) !== 'object') {
			throw new Error('Cannot expand non object' + Object.toString(routes));
		}
		Object.keys(routes).forEach(function (route) {
			if (route !== 'base') {
				expandedRoutes[ base + route ] = routes[route];
			}
		});

		return expandedRoutes;
	},
	// eventify = function (appli, config) {
	// 	var app = appli,
	// 		defaults = {
	// 			eventNames: function (route, verb) {
	// 				return 'state:' + route + ':' + verb;
	// 			},
	// 			setup: function (app, route, verb) {
	// 				var router = require('express').Router();

	// 				console.log('setting up route ', route, 'with ', verb);
	// 				if (router[verb]) {
	// 					router[verb](route, function (req, resp) {
	// 						app.emit(config.eventNames(route, verb), {req: req, resp: resp});
	// 					});

	// 					app.on('state:' + route + ':' + verb, function () {
	// 						console.log('event fired');
	// 						console.log(arguments);
	// 					});
	// 				} else {
	// 					logger.warn('Badly formed route.');
	// 				}
	// 			}
	// 		};

	// 	config = (Object.typeOf(config) === 'object') ? config : {};

	// 	config = Object.merge(config, defaults);

	// 	console.log('config : ', config);

	// 	//Accepts arbitrary number of routes object each with a unique `base` property
	// 	return function () {

	// 		var args = [].map.call(arguments, function (routes) {
	// 				return expandRoutes(routes);
	// 			}),
	// 			routesObj = Object.merge.apply(Object, args);

	// 		Object.keys(routesObj).forEach(function (route) {
	// 			var verbs = routesObj[route];

	// 			verbs.forEach(function (verb) {

	// 				config.setup(app, route, verb);

	// 			});
	// 		});
	// 	};
	// };


/*
Example isomorphic routes object
{
	base: '',
 	'/': 	 ['get', 'post', 'put', 'delete'],
	'/user': ['get']
 }
 */

module.exports = eventify;