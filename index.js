'use strict';

const http = require('http')
    , path = require('path')
    , utils = require('./utils')
    , events = require('harken')
    , pkg = require('./package.json')
    , parser = require('./utils/parser')

  //setup the routes and server
  //  pass in the http or https object and the routes.json
  //  then listen below on port/address you want to

    , wrapper = (config) => {
        const port = config.port || 3000
            , routePath = config.routeJSONPath || './routes.json'
            , publicPath = config.publicPath || './public'
            , routes = require(path.join(process.cwd(), routePath));

        let server;

        config.routeJSONPath = routePath;
        config.publicPath = publicPath;

        if(utils.not(utils.isDefined(config.compress))){
            config.compress = true;
        }

        //take care of any setup tasks before starting the server
        events.on('setup:complete', () => {
            server = require('./routes/index.js').server(http, routes, config);
            server.listen(port);

            console.log('monument v' + pkg.version +' up and running on port: ' + port);
        });


        utils.setup(config);

        return server;
    };

module.exports = {
    server: wrapper
    , events: events
    , parser: parser
};
