

const not = require('./tools').not
      , parseForm = (formString) => {
        const keys = formString.match(/(name=")([^"]+)(")([^a-zA-Z0-9]+)([^-]+)/g);

        if (not(keys === null)) {
          return keys.reduce((prevIn, current) => {
            const temp = current.match(/(")([^"])+/)
                  , prev = prevIn;

            prev[temp[0].replace(/"/g, '')] = current.match(/([\s].+)/)[0].replace(/^[\s]/, '');

            return prev;
          }, {});
        } else {
          return {};
        }
      };

module.exports = parseForm;
