'use strict';

const parseRoutes = (routes) => {
        return Object.keys(routes).reduce((prev, route) => {
            const routeVariables = route.match(/:[a-zA-Z]+/g);

            if(routeVariables){
                //generate the regex for laters and
                //  store the verbs and variables belonging to the route

                prev.wildcard[route] = {
                    verbs: routes[route]
                    , variables: routeVariables
                    , eventId: route
                    , regex: new RegExp('^' + route.replace(/:[a-zA-Z]+/g, '([^\/]+)').replace(/(\/)?$/, '(\/)?$'))
                };
            } else {
                prev.standard[route] = routes[route];
            }

            return prev;
        }, {wildcard: {}, standard: {}});
    };

module.exports = parseRoutes;
