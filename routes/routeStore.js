'use strict';
const pareseRoutes = require('./parseRoutes')

    , shallowMerge = (a = {}, b = {}) => {
        return Object.keys(b).reduce((result, key) => {
            const accum = result;

            if (Array.isArray(accum[key])) {
                accum[key] = [].concat(accum[key], b[key].filter((route) => {
                    return accum[key].indexOf(route) < 0;
                }));
            } else if (typeof accum[key] === 'object') {
                accum[key].verbs = [].concat(accum[key].verbs, b[key].verbs).filter((route) => {
                    return accum[key].verbs.indexOf(route) < 0;
                });
            } else {
                accum[key] = b[key];
            }

            return accum;
        }, a);
    }

    , mergeRoutes = (routeObj, newRoutesObj) => {
        const parsed = pareseRoutes(newRoutesObj);

        return {
            standard: shallowMerge(routeObj.standard, parsed.standard)
            , wildcard: shallowMerge(routeObj.wildcard, parsed.wildcard)
        };
    };

let routes = {
    standard: {}
    , wildcard: {}
};

module.exports = {
    add: (route, verbs) => {
        const routeObj = {};

        routeObj[route] = [].concat(verbs);

        routes = mergeRoutes(routes, routeObj);

        return routes;
    }

    , remove: (route, verbs) => {
        const isWildcard = Object.keys(routes.wildcard).find((rt) => {
            return !!route.match(routes.wildcard[rt].regex);
        });

        if (isWildcard) {
            // wildcard route to delete here
            if (typeof verbs === 'string') {
                // tst
            } else if (Array.isArray(verbs)) {
                // tst
            } else {
                // no verbs passed in clear it

            }
        } else {
            // standard route to delete here
            if (typeof verbs === 'string') {
                routes.standard[route] = routes.standard[route].filter((verb) => {
                    return verb !== verbs;
                });
            } else if (Array.isArray(verbs)) {
                routes.standard[route] = routes.standard[route].filter((verb) => {
                    return verbs.indexOf(verb) === -1;
                });

                if (routes.standard[route].length === 0) {
                    routes.standard[route] = undefined;
                }
            } else {
                // no verbs passed in clear it
                routes.standard[route] = undefined;
            }
        }

        return routes;
    }

    , get: () => {
        return { wildcard: routes.wildcard, standard: routes.standard };
    }

    , getStandard: () => {
        return routes.standard;
    }

    , getWildcard: () => {
        return routes.wildcard;
    }

    , clear: () => {
        routes = {
            standard: {}
            , wildcard: {}
        };
    }

    , parse: (routeObj) => {
        routes = mergeRoutes(routes, routeObj);

        return routes;
    }
};
