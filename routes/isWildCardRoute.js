'use strict';

const isWildCardRoute = (pathname, method, routesJson) => {
    const matchedRoutes = Object.keys(routesJson).find((route) => {
        return !!pathname.match(routesJson[route].regex);
    });

    let matchesVerb;

    if (matchedRoutes){
        matchesVerb = routesJson[matchedRoutes].verbs.indexOf(method) !== -1;
    } else {
        matchesVerb = false;
    }

    return !!(matchedRoutes && matchesVerb);
};

module.exports = isWildCardRoute;
