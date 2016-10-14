'use strict';

const path = require('path')
    , fs = require('fs')
    , zlib = require('zlib')
    , events = require('harken')
    , mime = require('mime')
    , brotli = require('iltorb')
    , routeStore = require('./routeStore')
    , matchSimpleRoute = require('./matchSimpleRoute')
    , isWildCardRoute = require('./isWildCardRoute')
    , parseWildCardRoute = require('./parseWildCardRoute')
    , setupStaticRoutes = require('./serverSetup')
    , setSecurityHeaders = require('../security')

    , not = require('../utils').not
    , send = require('../utils').send
    , setStatus = require('../utils').setStatus
    , parsePath = require('../utils').parsePath
    , getCompression = require('../utils').getCompression
    , redirect = require('../utils').redirect
    , contains = require('../utils').contains

    , succesStatus = 200
    , unmodifiedStatus = 304;

module.exports = (routesJson, config) => {
    const publicPath = config.publicPath
        , maxAge = config.maxAge
        , routePath = config.routePath
        , publicFolders = setupStaticRoutes(routePath, publicPath);

    routeStore.parse(routesJson);

    // the route handler... pulled out here for easier testing
    return (req, resIn) => {
        const method = req.method.toLowerCase()
            , pathParsed = parsePath(req.url)
            , pathname = pathParsed.pathname
            , simpleRoute = matchSimpleRoute(pathname, method, routeStore.getStandard())
            , expires = new Date().getTime()
            , connection = {
                req: req
                , res: resIn
                , query: pathParsed.query
                , params: {}
            }
            , compression = getCompression(req.headers['accept-encoding'], config);

        let file
            , routeInfo
            , res = resIn;

        // add .setStatus to response
        res.setStatus = setStatus();

        // add .send to the response
        res.send = send(req, config);
        res.redirect = redirect(req);

        res = setSecurityHeaders(config, req, res);

        // match the first part of the url... for public stuff
        if (contains(publicFolders, pathname.split('/')[1])) {
            // static assets y'all

            // this header allows proxies to cache different version based on
            //  the accept-encoding header. So (gzip/deflate/no compression)
            res.setHeader('Vary', 'Accept-Encoding');

            file = path.join(publicPath, pathname);
            // read in the file and stream it to the client
            fs.stat(file, (err, exists) => {
                if (!err && exists.isFile()) {

                    events.required([ `etag:check:${file}`, `etag:get:${file}` ], (valid) => {
                        if (valid[0]) { // does the etag match? YES
                            res.statusCode = unmodifiedStatus;
                            return res.end();
                        }
                        // No match...
                        res.setHeader('ETag', valid[1]); // the etag is item 2 in the array

                        if (req.method.toLowerCase() === 'head') {
                            res.writeHead(succesStatus, {
                                'Content-Type': mime.lookup(pathname)
                                , 'Cache-Control': `maxage=${maxAge}`
                                , Expires: new Date(expires + maxAge).toUTCString()
                                , 'Content-Encoding': compression
                            });

                            res.end();
                        } else if (not(compression === 'none')) {
                            // we have compression!
                            res.writeHead(succesStatus, {
                                'Content-Type': mime.lookup(pathname)
                                , 'Cache-Control': `maxage=${maxAge}`
                                , Expires: new Date(expires + maxAge).toUTCString()
                                , 'Content-Encoding': compression
                            });

                            if (compression === 'deflate') {
                                fs.stat(`${file}.def`, (errDef, existsDef) => {
                                    if (!errDef && existsDef.isFile()) {
                                        fs.createReadStream(`${file}.def`).pipe(res);
                                    } else {
                                        // no compressed file yet...
                                        fs.createReadStream(file).pipe(zlib.createDeflate())
                                            .pipe(res);

                                        fs.createReadStream(file).pipe(zlib.createDeflate())
                                            .pipe(fs.createWriteStream(`${file}.def`));
                                    }
                                });
                            } else if (compression === 'br') {
                                // brotli compression handling
                                fs.stat(`${file}.brot`, (errBrotli, existsBrotli) => {
                                    if (!errBrotli && existsBrotli.isFile()) {
                                        fs.createReadStream(`${file}.brot`).pipe(res);
                                    } else {
                                        // no compressed file yet...
                                        fs.createReadStream(file).pipe(brotli.compressStream())
                                            .pipe(res);

                                        fs.createReadStream(file).pipe(brotli.compressStream())
                                            .pipe(fs.createWriteStream(`${file}.brot`));
                                    }
                                });
                            } else {
                                fs.stat(`${file}.tgz`, (errTgz, existsTgz) => {
                                    if (!errTgz && existsTgz.isFile()) {
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

        } else if (path.join(process.cwd(), pathname) === routePath) {
            res.writeHead(succesStatus, {
                'Content-Type': mime.lookup('routes.json')
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
