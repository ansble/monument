'use strict';

const parseWildCardRoutes = (pathname, routesJson) => {

        var matchedRoute = Object.keys(routesJson).find(function (route) {
                return !!(pathname.match(routesJson[route].regex));
            })
            , matches = pathname.match(routesJson[matchedRoute].regex)
            , values = {}
            , routeInfo = routesJson[matchedRoute]
            , i = 0;

        for(i = 0; i < routeInfo.variables.length; i++){
            values[routeInfo.variables[i].substring(1)] = matches[i + 1]; //offset by one to avoid the whole match which is at array[0]
        }

        return {route: routeInfo, values: values};
    };

module.exports = parseWildCardRoutes;
