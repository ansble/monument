'use strict';

const events = require('harken')
    , pkg = require('./package.json')
    , parser = require('./utils/parser')
    , webSockets = require('./web-sockets')
    , uuid = require('uuid')
    , config = require('./utils/config')
    , setup = require('./utils').setup

  // setup the routes and server
  //  pass in the http or https object and the routes.json
  //  then listen below on port/address you want to

    , wrapper = (configIn) => {
        const configObj = config.set(configIn)
            , routes = require(configObj.routeJSONPath);

        let server;

        // take care of any setup tasks before starting the server
        events.once('setup:complete', () => {
            server = require('./routes/index.js').server(configObj.server, routes, configObj);
            server.listen(configObj.port);

            if (configIn.webSockets !== false) {
                // enables websockets for data requests
                webSockets(server, config.webSockets);
            }

            console.log(`monument v${pkg.version} up and running on port: ${configObj.port}`);
        });


        setup(configObj);

        return server;
    };

module.exports = {
    server: wrapper
    , events: events
    , parser: parser
    , createUUID: () => {
        return uuid.v4();
    }
};
