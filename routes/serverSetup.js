'use strict';
const path = require('path')
    , fs = require('fs')

    , isRouteFile = (fileName) => {
        return !fileName.match(/((index)|([._]test)).js$/) && fileName.match(/\.js$/);
    }

    , setup = (routePathIn, publicPathIn) => {
        // Be warned... this function is very much a side effet
        //  zone. It's full of them. There is no functional
        //  purity here. It returns the publicFolders which allows
        //  some modicum of testability but most of what it does
        //  deals with the FS.

        const publicFolders = [];

        // load in all the route handlers
        fs.readdirSync(routePathIn).forEach((file) => {
            if (isRouteFile(file)) {
                require(path.join(routePathIn, file));
            }
        });


        // load in all the static routes
        fs.stat(publicPathIn, (err, exists) => {
            if (!err && exists.isDirectory()) {
                fs.readdirSync(publicPathIn).forEach((file) => {
                    publicFolders.push(file);
                });
            }
        });

        return publicFolders;
    };

module.exports = setup;
