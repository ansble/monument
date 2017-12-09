
const path = require('path'),
      fs = require('fs'),
      isRouteFile = fileName => {
  return !fileName.match(/((index)|([._]test)).js$/) && fileName.match(/\.js$/);
},
      setup = (routePathIn, publicPathIn) => {

  const publicFolders = [];

  try {
    fs.readdirSync(routePathIn).forEach(file => {
      if (isRouteFile(file)) {
        require(path.join(routePathIn, file));
      }
    });
  } catch (err) {
    throw new Error(err);
  }

  try {
    const dir = fs.statSync(publicPathIn);

    if (dir.isDirectory()) {
      fs.readdirSync(publicPathIn).forEach(file => {
        publicFolders.push(file);
      });
    }
  } catch (err) {}

  return publicFolders;
};

module.exports = setup;