

const parseRoutes = (routes) => {
  return Object.keys(routes).reduce((prevIn, route) => {
    const routeVariables = route.match(/:[a-zA-Z]+/g)
          , prev = prevIn;

    let routeRegex;

    if (routeVariables) {
      // generate the regex for laters and
      //  store the verbs and variables belonging to the route

      routeRegex = route.replace(/:[a-zA-Z]+/g, '([^\/]+)').replace(/(\/)?$/, '(\/)?$');

      prev.wildcard[route] = {
        verbs: routes[route]
        , variables: routeVariables
        , eventId: route
        , regex: new RegExp(`^${routeRegex}`)
      };
    } else {
      prev.standard[route] = routes[route];
    }

    return prev;
  }, { wildcard: {}, standard: {} });
};

module.exports = parseRoutes;
