'use strict';

const parseRoutes = require('./parseRoutes')
    , matchSimpleRoute = require('./matchSimpleRoute')
    , isWildCardRoute = require('./isWildCardRoute')
    , parseWildCardRoute = require('./parseWildCardRoute')
    , isDefined = require('../utils').isDefined


    , serverInstance = (serverType, routesJson, config) => {
        const options = config.serverOptions;

        let server;

        if (isDefined(options)) {
            server = serverType.createServer(options, require('./router.js')(routesJson, config));
        } else {
            server = serverType.createServer(require('./router.js')(routesJson, config));
        }
        return server;
    };

module.exports = {
    server: serverInstance
    , parseWildCardRoute: parseWildCardRoute
    , isWildCardRoute: isWildCardRoute
    , parseRoutes: parseRoutes
    , matchSimpleRoute: matchSimpleRoute
};
