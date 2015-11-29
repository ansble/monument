'use strict';

const parseRoutes = require('./parseRoutes')
    , matchSimpleRoute = require('./matchSimpleRoute')
    , isWildCardRoute = require('./isWildCardRoute')
    , parseWildCardRoute = require('./parseWildCardRoute')


    , server = (serverType, routesJson, config) => {
        let serverReturn;

        if (config.key && config.cert) {
            serverReturn = serverType.createServer({
                key: config.key
                , cert: config.cert
            }, require('./router.js')(routesJson, config));
        } else {
            serverReturn = serverType.createServer(require('./router.js')(routesJson, config));
        }
        return serverReturn;
    };

module.exports = {
    server: server
    , parseWildCardRoute: parseWildCardRoute
    , isWildCardRoute: isWildCardRoute
    , parseRoutes: parseRoutes
    , matchSimpleRoute: matchSimpleRoute
};
