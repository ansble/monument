'use strict';

const events = require('harken')
    , pkg = require('./package.json')
    , parser = require('./utils/parser')
    , webSockets = require('./web-sockets')
    , uuid = require('uuid')
    , config = require('./utils/config')
    , setup = require('./utils').setup
    , routeStore = require('./routes/routeStore')

    , wrapper = (configIn) => {
        const configObj = config.set(configIn)
            , routes = require(configObj.routeJSONPath);

        let server;

        // take care of any setup tasks before starting the server
        events.once('setup:complete', () => {
            server = require('./routes/index').server(configObj.server, routes, configObj);
            server.listen(configObj.port);

            if (configIn.webSockets !== false) {
                // enables websockets for data requests
                webSockets(server, configIn.webSockets);
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
    , routes: routeStore
    , createUUID: () => {
        return uuid.v4();
    }
};
