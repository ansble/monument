'use strict';

const isWildCardRoute = (pathname, method, routesJson) => {
        var matchedRoutes = Object.keys(routesJson).filter(function (route) {
                return !!(pathname.match(routesJson[route].regex));
            })
            , matchesVerb;

        if(matchedRoutes.length){
            matchesVerb = routesJson[matchedRoutes[0]].verbs.indexOf(method) !== -1;
        } else {
            matchesVerb = false;
        }

        return matchedRoutes.length > 0 && matchesVerb;
    };

module.exports = isWildCardRoute;
