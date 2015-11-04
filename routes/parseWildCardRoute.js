'use strict';

const parseWildCardRoutes = (pathname, routesJson) => {

    const matchedRoute = Object.keys(routesJson).find((route) => {
            return !!pathname.match(routesJson[route].regex);
        })
        , matches = pathname.match(routesJson[matchedRoute].regex)
        , values = {}
        , routeInfo = routesJson[matchedRoute];

    let i = 0;

    // TODO: convert to map function
    for (i = 0; i < routeInfo.variables.length; i++){
        // offset by one to avoid the whole match which is at array[0]
        values[routeInfo.variables[i].substring(1)] = matches[i + 1];
    }

    return { route: routeInfo, values: values };
};

module.exports = parseWildCardRoutes;
