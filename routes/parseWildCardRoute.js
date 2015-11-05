'use strict';

const parseWildCardRoutes = (pathname, routesJson) => {

    const matchedRoute = Object.keys(routesJson).find((route) => {
            return !!pathname.match(routesJson[route].regex);
        })
        , matches = pathname.match(routesJson[matchedRoute].regex)
        , routeInfo = routesJson[matchedRoute]
        , values = routeInfo.variables.reduce((prevIn, current, i) => {
            const prev = prevIn;

            prev[current.substring(1)] = matches[i + 1];

            return prev;
        }, {});

    return { route: routeInfo, values: values };
};

module.exports = parseWildCardRoutes;
