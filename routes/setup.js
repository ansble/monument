'use strict';
const path = require('path')
    , fs = require('fs');

module.exports = (routePathIn, publicPathIn) => {

        var routePath = path.join(process.cwd(), routePathIn)
        , publicPath = publicPathIn
        , publicFolders = [];

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

        return publicFolders;
    };
