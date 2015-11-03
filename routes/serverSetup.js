'use strict';
const path = require('path')
    , fs = require('fs')

    , setup = (routePathIn, publicPathIn) => {
        //Be warned... this function is very much a side effet
        //  zone. It's full of them. There is no functional
        //  purity here. It returns the publicFolders which allows
        //  some modicum of testability but most of what it does
        //  deals with the FS.

        const publicFolders = [];
        //load in all the route handlers
        fs.readdirSync(routePathIn).forEach(function (file) {
            if(file !== 'index.js' &&
                !file.match(/_test\.js$/) &&
                !file.match(/.test\.js$/) &&
                file.match(/.js$/)){
                require(path.join(routePathIn, file));
            }
        });


        //load in all the static routes
        fs.stat(publicPathIn, function (err, exists) {
            if(!err && exists.isDirectory()){
                fs.readdirSync(publicPathIn).forEach(function (file) {
                    publicFolders.push(file);
                });
            }
        });

        return publicFolders;
    };

module.exports = setup;
