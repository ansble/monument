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

    , publicFolders = []

    , setupStaticRoutes = (routePathIn, publicPathIn) => {
        'use strict';

        var routePath = path.join(process.cwd(), routePathIn)
        , publicPath = publicPathIn;

        //load in all the route handlers
        fs.readdirSync(routePath).forEach(function (file) {
            if(file !== 'index.js' && !file.match(/_test\.js$/)){
                require(path.join(routePath, file));
            }
        });

        //load in all the static routes
        fs.exists(publicPath, function (exists) {
            if(exists){
                fs.readdirSync(publicPath).forEach(function (file) {
                    publicFolders.push(file);
                });
            }
        });
    };

const server = (serverType, routesJson, config) => {
    'use strict';

    var routesObj = parseRoutes(routesJson)
        , publicPath = path.join(process.cwd(), config.publicPath || './public')
        , maxAge = config.maxAge || 31658000000
        , routesPath = config.routesPath || '/routes'
        , routeJSONPath = config.routeJSONPath || './routes.json';

        setupStaticRoutes(routesPath, publicPath);

    return serverType.createServer((req, res) => {
        var method = req.method.toLowerCase()
            , pathParsed = utils.parsePath(req.url)
            , pathname = pathParsed.pathname
            , compression
            , file
            , simpleRoute = matchSimpleRoute(pathname, method, routesObj.standard)
            , expires = new Date().getTime()
            , connection = {
                req: req
                , res: res
                , query: pathParsed.query
                , params: {}
            };

        //add .send to the response
        res.send = utils.send(req, config);

        //match the first part of the url... for public stuff
        if (publicFolders.indexOf(pathname.split('/')[1]) !== -1) {
            //static assets y'all
            file = path.join(publicPath, pathname);
            //read in the file and stream it to the client
            fs.exists(file, function (exists) {
                if(exists){

                    events.required(['etag:check:' + file, 'etag:get:' + file], function (valid) {
                        if(valid[0]){ // does the etag match? YES
                            res.statusCode = 304;
                            res.end();
                        } else { //No match...
                            res.setHeader('ETag', valid[1]); //the etag is item 2 in the array

                            compression = utils.getCompression(req.headers['accept-encoding'], config);

                            if(req.method.toLowerCase() === 'head'){
                                res.writeHead(200, {
                                    'Content-Type': mime.lookup(pathname)
                                    , 'Cache-Control': 'maxage=' + maxAge
                                    , 'Expires': new Date(expires + maxAge).toUTCString()
                                    , 'Content-Encoding': compression
                                });

                                res.end();
                            } else if (compression !== 'none'){
                                //we have compression!
                                res.writeHead(200, {
                                    'Content-Type': mime.lookup(pathname)
                                    , 'Cache-Control': 'maxage=' + maxAge
                                    , 'Expires': new Date(expires + maxAge).toUTCString()
                                    , 'Content-Encoding': compression
                                });

                                if(compression === 'deflate'){
                                    fs.exists(file + '.def', function(exists){
                                        if(exists){
                                            fs.createReadStream(file + '.def').pipe(res);
                                        } else {
                                            //no compressed file yet...
                                            fs.createReadStream(file).pipe(zlib.createDeflate()).pipe(res);
                                            fs.createReadStream(file).pipe(zlib.createDeflate()).pipe(fs.createWriteStream(file + '.def'));
                                        }
                                    });
                                } else {
                                    fs.exists(file + '.tgz', function(exists){
                                        if(exists){
                                            fs.createReadStream(file + '.tgz').pipe(res);
                                        } else {
                                            //no compressed file yet...
                                            fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res);
                                            fs.createReadStream(file).pipe(zlib.createGzip()).pipe(fs.createWriteStream(file + '.tgz'));
                                        }
                                    });
                                 }

                                events.emit('static:served', pathname);

                            } else {
                                //no compression carry on...
                                //return with the correct heders for the file type
                                res.writeHead(200, {
                                    'Content-Type': mime.lookup(pathname),
                                    'Cache-Control': 'maxage=' + maxAge,
                                    'Expires': new Date(expires + maxAge).toUTCString()
                                });
                                fs.createReadStream(file).pipe(res);
                                events.emit('static:served', pathname);
                            }
                        }
                    });

                    events.emit('etag:check', {file: file, etag: req.headers['if-none-match']});

                } else {
                    events.emit('static:missing', pathname);
                    events.emit('error:404', connection);
                }
            });

        } else if (simpleRoute !== null) {
            //matches a route in the routes.json
            events.emit('route:' + simpleRoute + ':' + method, connection);

        } else if (isWildCardRoute(pathname, method, routesObj.wildcard)) {
            var routeInfo = parseWildCardRoute(pathname, routesObj.wildcard);

            connection.params = routeInfo.values;

            //emit the event for the url minus params and include the params
            //  in the params object
            events.emit('route:' + routeInfo.route.eventId + ':' + method, connection);
        } else if(pathname === routesPath){
            res.writeHead(200, {
                'Content-Type': mime.lookup('routes.json')
            });
            fs.createReadStream(path.join(process.cwd(), routeJSONPath)).pipe(res);
        } else {
            events.emit('error:404', connection);
        }
    });
};

module.exports = {
    server: server
    , parseWildCardRoute: parseWildCardRoute
    , isWildCardRoute: isWildCardRoute
    , parseRoutes: parseRoutes
    , matchSimpleRoute: matchSimpleRoute
};
