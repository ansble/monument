'use strict';

const http = require('http')
    , path = require('path')
    , utils = require('./utils')
    , events = require('harken')
    , pkg = require('./package.json')
    , parser = require('./utils/parser')
    , webSockets = require('./web-sockets')

    , defaultPort = 3000

  // setup the routes and server
  //  pass in the http or https object and the routes.json
  //  then listen below on port/address you want to

    , wrapper = (configIn) => {
        const port = configIn.port || defaultPort
            , routePath = configIn.routeJSONPath || './routes.json'
            , publicPath = configIn.publicPath || './public'
            , routes = require(path.join(process.cwd(), routePath))
            , config = configIn;

        let server;

        config.routeJSONPath = routePath;
        config.publicPath = publicPath;

        if (utils.not(utils.isDefined(config.compress))){
            config.compress = true;
        }

        // take care of any setup tasks before starting the server
        events.on('setup:complete', () => {
            server = require('./routes/index.js').server(http, routes, config);
            server.listen(port);

            if (utils.not(configIn.webSockets === false)) {
                // enables websockets for data requests
                webSockets(server, config.webSockets);
            }

            console.log(`monument v${pkg.version} up and running on port: ${port}`);
        });


        utils.setup(config);

        return server;
    };

module.exports = {
    server: wrapper
    , events: events
    , parser: parser
};
