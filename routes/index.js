'use strict';

const parseRoutes = require('./parseRoutes')
    , matchSimpleRoute = require('./matchSimpleRoute')
    , isWildCardRoute = require('./isWildCardRoute')
    , parseWildCardRoute = require('./parseWildCardRoute')


    , server = (serverType, routesJson, config) => {
        return serverType.createServer(require('./router.js')(routesJson, config));
    };

module.exports = {
    server: server
    , parseWildCardRoute: parseWildCardRoute
    , isWildCardRoute: isWildCardRoute
    , parseRoutes: parseRoutes
    , matchSimpleRoute: matchSimpleRoute
};
