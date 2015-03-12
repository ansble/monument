var http = require('http')
	, dot = require('dot')
	, path = require('path')

	, events = require('./emitter')
	, pkg = require('./package.json')
	, parser = require('./utils/parser')

  //setup the routes and server
  //  pass in the http or https object and the routes.json
  //  then listen below on port/address you want to
  , server

	, wrapper = function (config) {
		'use strict';

		var config = config || {}
			, routes;

		if(typeof config.compress === 'undefined'){
			config.compress = true;
		}

    if(typeof config.port === 'undefined'){
      config.port = 3000;
    }

    if(typeof config.templatePath === 'undefined'){
      config.templatePath = './templates';
    }

    if(typeof config.routePath === 'undefined'){
      config.routePath = './routes';
    }

    if(typeof config.routeJSONPath === 'undefined'){
      config.routeJSONPath = './routes.json';
    }

		//configure dotjs
		if (config.dotjs) {
			Object.keys(config.dotjs).forEach(function (opt) {
				dot.templateSettings[opt] = config.dotjs[opt];
			});
		}

    routes = require(path.join(process.cwd(), config.routeJSONPath));

		//compile the templates!
		dot.process({path: path.join(process.cwd(), config.templatePath)});

		server = require('./routes/index.js').server(http, routes, config);

		server.listen(config.port);

		console.log('monument v' + pkg.version +' up and running on port: ' + config.port);

    return server;
	};

//set up the etag listeners and emitters
require('./utils/staticFileEtags');

module.exports = {
	server: wrapper
	, events: events
	, parser: parser
};
