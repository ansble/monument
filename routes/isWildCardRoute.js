'use strict';

const contains = require('../utils').contains
    , isWildCardRoute = (pathname, method, routesJson) => {
        const matchedRoutes = Object.keys(routesJson).find((route) => {
            return !!pathname.match(routesJson[route].regex);
        });

        let matchesVerb;

        if (matchedRoutes){
            matchesVerb = contains(routesJson[matchedRoutes].verbs, method);
        } else {
            matchesVerb = false;
        }

        return !!(matchedRoutes && matchesVerb);
    };

module.exports = isWildCardRoute;
