
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
        try {
          fs.readdirSync(routePathIn).forEach((file) => {
            if (isRouteFile(file)) {
              require(path.join(routePathIn, file));
            }
          });
        } catch (err) {
          throw new Error(err);
        }

        // load in all the static routes
        try {
          const dir = fs.statSync(publicPathIn);

          if (dir.isDirectory()) {
            fs.readdirSync(publicPathIn).forEach((file) => {
              publicFolders.push(file);
            });
          }
        } catch (err) {
          // do nothing... there will be no static files
        }

        return publicFolders;
      };

module.exports = setup;
