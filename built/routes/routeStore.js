
const pareseRoutes = require('./parseRoutes'),
      shallowMerge = require('./shallowMerge'),
      mergeRoutes = (routeObj, newRoutesObj) => {
  const parsed = pareseRoutes(newRoutesObj);

  return {
    standard: shallowMerge(routeObj.standard, parsed.standard),
    wildcard: shallowMerge(routeObj.wildcard, parsed.wildcard)
  };
},
      isWildcard = (route, routes) => {
  return Object.keys(routes.wildcard).find(rt => {
    return typeof routes.wildcard[rt] !== 'undefined' && route.match(routes.wildcard[rt].regex);
  });
},
      notARoute = (route, routes) => {
  return typeof routes.wildcard[route] === 'undefined' && typeof routes.standard[route] === 'undefined';
},
      cleanupRoute = (route, routesIn) => {
  const routes = routesIn;

  if (routes.wildcard[route] && routes.wildcard[route].verbs.length === 0) {
    routes.wildcard[route] = undefined;
  } else if (routes.standard[route] && routes.standard[route].length === 0) {
    routes.standard[route] = undefined;
  }

  return routes;
};

let routes = {
  standard: {},
  wildcard: {}
};

module.exports = {
  add: (route, verbs) => {
    const routeObj = {};

    routeObj[route] = [].concat(verbs);

    routes = mergeRoutes(routes, routeObj);

    return routes;
  },

  remove: (route, verbs) => {
    const isWildcardRoute = isWildcard(route, routes);

    if (notARoute(route, routes)) {
      return routes;
    }

    if (typeof verbs === 'undefined') {
      routes.wildcard[route] = undefined;
      routes.standard[route] = undefined;

      return routes;
    }

    if (isWildcardRoute) {
      routes.wildcard[route].verbs = routes.wildcard[route].verbs.filter(verb => {
        return [].concat(verbs).indexOf(verb) === -1;
      });
    } else {
      routes.standard[route] = routes.standard[route].filter(verb => {
        return [].concat(verbs).indexOf(verb) === -1;
      });
    }

    return cleanupRoute(route, routes);
  },

  get: () => {
    return { wildcard: routes.wildcard, standard: routes.standard };
  },

  getStandard: () => {
    return routes.standard;
  },

  getWildcard: () => {
    return routes.wildcard;
  },

  clear: () => {
    routes = {
      standard: {},
      wildcard: {}
    };
  },

  parse: routeObj => {
    return mergeRoutes(routes, routeObj);
  }
};