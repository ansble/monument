

const minusOne = -1,
      matchSimpleRoute = (pathname, method, routesJson) => {
  let pathString, route;

  if (pathname.slice(minusOne) === '/') {
    pathString = pathname.replace(/\/$/, '');
  } else {
    pathString = `${pathname}/`;
  }

  if (routesJson[pathname] && routesJson[pathname].indexOf(method) !== minusOne) {
    route = pathname;
  } else if (routesJson[pathString] && routesJson[pathString].indexOf(method) !== minusOne) {
    route = pathString;
  } else {
    route = null;
  }

  return route;
};

module.exports = matchSimpleRoute;