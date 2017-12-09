

const parseRoutes = routes => {
  return Object.keys(routes).reduce((prevIn, route) => {
    const routeVariables = route.match(/:[a-zA-Z]+/g),
          prev = prevIn;

    let routeRegex;

    if (routeVariables) {

      routeRegex = route.replace(/:[a-zA-Z]+/g, '([^\/]+)').replace(/(\/)?$/, '(\/)?$');

      prev.wildcard[route] = {
        verbs: routes[route],
        variables: routeVariables,
        eventId: route,
        regex: new RegExp(`^${routeRegex}`)
      };
    } else {
      prev.standard[route] = routes[route];
    }

    return prev;
  }, { wildcard: {}, standard: {} });
};

module.exports = parseRoutes;