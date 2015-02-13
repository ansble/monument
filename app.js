var routes
	, http = require('http')
	, dot = require('dot')
	, path = require('path')
	, getRawBody = require('raw-body')
	, typer = require('media-typer')
	, querystring = require('querystring')

	, staticEtag = require('./utils/staticFileEtags')

	, pkg = require('./package.json')

	//setup the routes and server
	//	pass in the http or https object and the routes.json
	//	then listen below on port/address you want to
	, server

	, parseForm = function (formString) {
		var rtnObj = {}
			, keys  = formString.match(/([\n\r].+)/g) //formString.match(/(form-data; name=['"])([^"']+)/g)
			, currenName;

		if(keys !== null){
			keys.forEach(function (item) {
				var name = item.match(/(form-data; name=['"])([^"']+)/);
				if (name) {
					//this is a key
					currentName = name[0].replace(/form-data; name=['"]/, '');
				} else if (!item.match(/FormBoundary/ && typeof currentName !== 'undefined')) {
					//this is a value
					rtnObj[currentName] = item.replace(/[\n]/,'');
				}
			});
		} else {
			rtnObj = querystring.parse(formString);
		}

		return rtnObj;
	}

	, parser = function (connection, callback, scope) {//parse out the body
		getRawBody(connection.req, {
		    length: connection.req.headers['content-length'],
		    limit: '1mb',
		    encoding: typer.parse(connection.req.headers['content-type']).parameters.charset || 'UTF-8'
		  }, function (err, string) {
		    if (err){
		      emitter.emit('error:parse', err);
		      return err;
		    }
		    
	    	try{
	    		callback.apply(scope, [JSON.parse(string)]);
	    	} catch (e) {
		    	callback.apply(scope, [parseForm(string)]);
	    	}
		});
	}

	, wrapper = function (config) {
		var port = config.port || 3000
			, templatePath = config.templatePath || './templates'
			, routePath = config.routePath || './routes.json'
			, routes = require(path.join(process.cwd(), routePath));

		if(typeof config.compress === 'undefined'){
			config.compress = true;
		}

		//compile the templates!
		dot.process({path: path.join(process.cwd(), templatePath)});

		server = require('./routes/index.js').server(http, routes, config);

		server.listen(port);

		console.log('monument v' + pkg.version +' up and running on port: ' + port);
	};

module.exports = {
	server: wrapper
	, events: require('./emitter.js')
	, parser: parser
};