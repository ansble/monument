'use strict';

const isWildCardRoute = (pathname, method, routesJson) => {
        var matchedRoutes = Object.keys(routesJson).find(function (route) {
                return !!(pathname.match(routesJson[route].regex));
            })
            , matchesVerb;

        if(matchedRoutes){
            matchesVerb = routesJson[matchedRoutes].verbs.indexOf(method) !== -1;
        } else {
            matchesVerb = false;
        }

        return !!(matchedRoutes && matchesVerb);
    };

module.exports = isWildCardRoute;
