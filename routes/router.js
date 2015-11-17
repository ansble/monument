'use strict';

const path = require('path')
    , fs = require('fs')
    , zlib = require('zlib')
    , events = require('harken')
    , utils = require('../utils')
    , mime = require('mime')
    , parseRoutes = require('./parseRoutes')
    , matchSimpleRoute = require('./matchSimpleRoute')
    , isWildCardRoute = require('./isWildCardRoute')
    , parseWildCardRoute = require('./parseWildCardRoute')
    , setupStaticRoutes = require('./serverSetup')
    , setSecurityHeaders = require('../security')

    , succesStatus = 200
    , unmodifiedStatus = 304
    , oneYearMS = 31658000000;

module.exports = (routesJson, config) => {
    const routesObj = parseRoutes(routesJson)
            , publicPath = path.join(process.cwd(), config.publicPath || './public')
            , maxAge = config.maxAge || oneYearMS
            , routesPath = path.join(process.cwd(), config.routesPath || './routes')
            , publicFolders = setupStaticRoutes(routesPath, publicPath);

    // the route handler... pulled out here for easier testing
    return (req, resIn) => {
        const method = req.method.toLowerCase()
            , pathParsed = utils.parsePath(req.url)
            , pathname = pathParsed.pathname
            , simpleRoute = matchSimpleRoute(pathname, method, routesObj.standard)
            , expires = new Date().getTime()
            , connection = {
                req: req
                , res: resIn
                , query: pathParsed.query
                , params: {}
            }
            , compression = utils.getCompression(req.headers['accept-encoding'], config);

        let file
            , routeInfo
            , res = resIn;

        // add .send to the response
        res.send = utils.send(req, config);
        res.redirect = utils.redirect(req);

        res = setSecurityHeaders(config, req, res);

        // match the first part of the url... for public stuff
        if (utils.contains(publicFolders, pathname.split('/')[1])) {
            // static assets y'all

            // this header allows proxies to cache different version based on
            //  the accept-encoding header. So (gzip/deflate/no compression)
            res.setHeader('Vary', 'Accept-Encoding');

            file = path.join(publicPath, pathname);
            // read in the file and stream it to the client

            fs.stat(file, (err, exists) => {
                if (!err && exists.isFile()){

                    events.required([ `etag:check:${file}`, `etag:get:${file}` ], (valid) => {
                        if (valid[0]){ // does the etag match? YES
                            res.statusCode = unmodifiedStatus;
                            return res.end();
                        }
                        // No match...
                        res.setHeader('ETag', valid[1]); // the etag is item 2 in the array

                        if (req.method.toLowerCase() === 'head'){
                            res.writeHead(succesStatus, {
                                'Content-Type': mime.lookup(pathname)
                                , 'Cache-Control': `maxage=${maxAge}`
                                , Expires: new Date(expires + maxAge).toUTCString()
                                , 'Content-Encoding': compression
                            });

                            res.end();
                        } else if (utils.not(compression === 'none')){
                            // we have compression!
                            res.writeHead(succesStatus, {
                                'Content-Type': mime.lookup(pathname)
                                , 'Cache-Control': `maxage=${maxAge}`
                                , Expires: new Date(expires + maxAge).toUTCString()
                                , 'Content-Encoding': compression
                            });

                            if (compression === 'deflate'){
                                fs.stat(`${file}.def`, (errDef, existsDef) => {
                                    if (!errDef && existsDef.isFile()){
                                        fs.createReadStream(`${file}.def`).pipe(res);
                                    } else {
                                        // no compressed file yet...
                                        fs.createReadStream(file).pipe(zlib.createDeflate())
                                            .pipe(res);

                                        fs.createReadStream(file).pipe(zlib.createDeflate())
                                            .pipe(fs.createWriteStream(`${file}.def`));
                                    }
                                });
                            } else {
                                fs.stat(`${file}.tgz`, (errTgz, existsTgz) => {
                                    if (!errTgz && existsTgz.isFile()){
                                        fs.createReadStream(`${file}.tgz`).pipe(res);
                                    } else {
                                        // no compressed file yet...
                                        fs.createReadStream(file).pipe(zlib.createGzip())
                                            .pipe(res);

                                        fs.createReadStream(file).pipe(zlib.createGzip())
                                            .pipe(fs.createWriteStream(`${file}.tgz`));
                                    }
                                });
                            }

                            events.emit('static:served', pathname);

                        } else {
                            // no compression carry on...
                            // return with the correct heders for the file type
                            res.writeHead(succesStatus, {
                                'Content-Type': mime.lookup(pathname)
                                , 'Cache-Control': `maxage=${maxAge}`
                                , Expires: new Date(expires + maxAge).toUTCString()
                            });
                            fs.createReadStream(file).pipe(res);
                            events.emit('static:served', pathname);
                        }
                    });

                    events.emit('etag:check', { file: file, etag: req.headers['if-none-match'] });

                } else {
                    events.emit('static:missing', pathname);
                    events.emit('error:404', connection);
                }
            });

        } else if (simpleRoute !== null) {
            // matches a route in the routes.json
            events.emit(`route:${simpleRoute}:${method}`, connection);

        } else if (path.join(process.cwd(), pathname) === routesPath){
            res.writeHead(succesStatus, {
                'Content-Type': mime.lookup('routes.json')
            });

            res.send(routesJson);

        } else if (isWildCardRoute(pathname, method, routesObj.wildcard)) {
            // matches a route in the routes.json file that has params
            routeInfo = parseWildCardRoute(pathname, routesObj.wildcard);

            connection.params = routeInfo.values;

            // emit the event for the url minus params and include the params
            //  in the params object
            events.emit(`route:${routeInfo.route.eventId}:${method}`, connection);
        } else {
            events.emit('error:404', connection);
        }
    };
};
