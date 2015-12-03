'use strict';

const parseRoutes = require('./parseRoutes')
    , matchSimpleRoute = require('./matchSimpleRoute')
    , isWildCardRoute = require('./isWildCardRoute')
    , parseWildCardRoute = require('./parseWildCardRoute')
    , isDefined = require('../utils').isDefined


    , serverInstance = (serverType, routesJson, config) => {
        const options = config.serverOptions;

        if (isDefined(options)) {
            return serverType.createServer(options, require('./router.js')(routesJson, config));
        } else {
            return serverType.createServer(require('./router.js')(routesJson, config));
        }
    };

module.exports = {
    server: serverInstance
    , parseWildCardRoute: parseWildCardRoute
    , isWildCardRoute: isWildCardRoute
    , parseRoutes: parseRoutes
    , matchSimpleRoute: matchSimpleRoute
};
