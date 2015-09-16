'use strict';

const matchSimpleRoute = (pathname, method, routesJson)  => {
        let pathString
            , route;

        if(pathname.slice(-1) === '/'){
            pathString = pathname.replace(/\/$/,'');
        } else {
            pathString = pathname + '/';
        }

        if(routesJson[pathname] && routesJson[pathname].indexOf(method) !== -1){
            route = pathname;
        } else if (routesJson[pathString] && routesJson[pathString].indexOf(method) !== -1){
            route = pathString;
        } else {
            route = null;
        }

        return route;
    };

module.exports = matchSimpleRoute;
