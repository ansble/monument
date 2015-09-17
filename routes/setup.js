'use strict';
const path = require('path')
    , fs = require('fs')

    , setup = (routePathIn, publicPathIn) => {
        //Be warned... this function is very much a side effet
        //  zone. It's full of them. There is no functional
        //  purity here. It returns the publicFolders which allows
        //  some modicum of testability but most of what it does
        //  deals with the FS.

        const routePath = path.join(process.cwd(), routePathIn)
        , publicFolders = [];

        //load in all the route handlers
        fs.readdirSync(routePath).forEach(function (file) {
            if(file !== 'index.js' && !file.match(/_test\.js$/)){
                require(path.join(routePath, file));
            }
        });

        //load in all the static routes
        fs.exists(publicPathIn, function (exists) {
            if(exists){
                fs.readdirSync(publicPathIn).forEach(function (file) {
                    publicFolders.push(file);
                });
            }
        });

        return publicFolders;
    };

module.exports = setup;
