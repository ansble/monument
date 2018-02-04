'use strict';

const path = require('path')
      , events = require('harken')
      , mime = require('mime')
      , onHeader = require('on-headers')
      , routeStore = require('./routeStore')
      , matchSimpleRoute = require('./matchSimpleRoute')
      , isWildCardRoute = require('./isWildCardRoute')
      , parseWildCardRoute = require('./parseWildCardRoute')
      , setupStaticRoutes = require('./serverSetup')
      , performanceHeaders = require('./performanceHeaders')
      , setSecurityHeaders = require('../security')
      , handleStaticFile = require('./handleStaticFile')

      , send = require('../utils').send
      , setStatus = require('../utils').setStatus
      , parsePath = require('../utils').parsePath
      , redirect = require('../utils').redirect
      , contains = require('../utils').contains

      , statsd = require('../utils/statsd')

      , succesStatus = 200;

module.exports = (routesJson, config) => {
  const publicPath = config.publicPath
        , routePath = config.routePath
        , publicFolders = setupStaticRoutes(routePath, publicPath)
        , logger = config.log
        , statsdClient = config.statsd === false ? false : statsd.create(config.statsd)

        , setupStatsdListeners = (res, sendStatsd, cleanup) => {
          if (statsdClient) {
            // Add response listeners
            res.once('finish', sendStatsd);
            res.once('error', cleanup);
            res.once('close', cleanup);
          }
        };

  routeStore.parse(routesJson);
  // the route handler... pulled out here for easier testing
  return (req, resIn) => {
    const method = req.method.toLowerCase()
          , pathParsed = parsePath({ urlStr: req.url, unsafeQuery: config.security && config.security.unsafeQuery })
          , pathname = pathParsed.pathname
          , simpleRoute = matchSimpleRoute(pathname, method, routeStore.getStandard())
          , connection = {
            req: req
            , res: resIn
            , query: pathParsed.query
            , params: {}
            , path: pathParsed
          }
          , statsdStartTime = new Date().getTime()

          , cleanupStatsd = () => {
            // one time exception to make cleanup work
            /* eslint-disable no-use-before-define */
            resIn.removeListener('finish', sendStatsd);
            /* eslint-enable no-use-before-define */
            resIn.removeListener('error', cleanupStatsd);
            resIn.removeListener('close', cleanupStatsd);
          }

          , sendStatsd = () => {
            const duration = new Date().getTime() - statsdStartTime
                  , statusCode = resIn.statusCode || 'unknown_status'
                  , key = [
                    'http'
                    , method.toLowerCase()
                    , pathname.replace(/[.]/g, '_')
                  ].join('.');

            // Status Code
            statsdClient.send(`${key}.status_code.${statusCode}`, 1, 'c', 1, [], (err) => {
              if (err) {
                logger.error(`[statsd] request count send error: ${err}`);
              }
            });

            // Response Time
            statsdClient.timing(`${key}.response_time`, duration, (err) => {
              if (err) {
                logger.error(`[statsd] timing send error: ${err}`);
              }
            });

            cleanupStatsd();
          }
          , timers = {};

    let routeInfo
        , res = resIn;

    res.timers = performanceHeaders(timers);

    res.timers.start('Request');


    onHeader(res, () => {
      const mapping = Object.keys(timers).map((key, i) => {
        const delta = timers[key].delta || res.timers.end(key);

        return `${i}=${delta}; "${key}"`;
      }).join(', ');

      res.setHeader('Server-Timing', mapping);
    });

    setupStatsdListeners(res, sendStatsd, cleanupStatsd);

    res.setStatus = setStatus;
    res.send = send(req, config);
    res.redirect = redirect(req);
    res = setSecurityHeaders(config, req, res);

    // match the first part of the url... for public stuff
    if (contains(publicFolders, pathname.split('/')[1])) {
      // this header allows proxies to cache different version based on
      //  the accept-encoding header. So (gzip/deflate/no compression)
      res.setHeader('Vary', 'Accept-Encoding');

      // read in the file and stream it to the client
      handleStaticFile(path.join(publicPath, pathname), connection, config);

    } else if (simpleRoute !== null) {
      // matches a route in the routes.json
      events.emit(`route:${simpleRoute}:${method}`, connection);

    } else if (path.join(process.cwd(), pathname) === routePath) {
      res.writeHead(succesStatus, {
        'Content-Type': mime.getType('routes.json')
      });

      res.send(routesJson);

    } else if (isWildCardRoute(pathname, method, routeStore.getWildcard())) {
      // matches a route in the routes.json file that has params
      routeInfo = parseWildCardRoute(pathname, routeStore.getWildcard());
      connection.params = routeInfo.values;

      // emit the event for the url minus params and include the params
      //  in the params object
      events.emit(`route:${routeInfo.route.eventId}:${method}`, connection);
    } else {
      events.emit('error:404', connection);
    }
  };
};
