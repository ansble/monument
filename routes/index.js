'use strict';

const parseRoutes = require('./parseRoutes')
    , matchSimpleRoute = require('./matchSimpleRoute')
    , isWildCardRoute = require('./isWildCardRoute')
    , parseWildCardRoute = require('./parseWildCardRoute')
    , isDefined = require('../utils').isDefined

    , serverInstance = (serverType, routesJson, configObj) => {
        const options = configObj.serverOptions;

        if (isDefined(options)) {
            return serverType.createServer(options, require('./router.js')(routesJson, configObj));
        } else {
            return serverType.createServer(require('./router.js')(routesJson, configObj));
        }
    };

module.exports = {
    server: serverInstance
    , parseWildCardRoute: parseWildCardRoute
    , isWildCardRoute: isWildCardRoute
    , parseRoutes: parseRoutes
    , matchSimpleRoute: matchSimpleRoute
};
