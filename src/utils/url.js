

// replacement for node's built-in 'url.parse' that safely removes the square brackets
// supports only parseQueryString = true therefore does not accept that argument
const url = require('url')
      , tools = require('./tools')

      , parse = (urlStr, slashesDenoteHost) => {
        const urlObject = url.parse(urlStr, true, slashesDenoteHost)
              , query = urlObject.query
              , isDefined = tools.isDefined
              , isUndefined = tools.isUndefined

              , tempQuery = Object.keys(urlObject.query).reduce((prevIn, key) => {
                const newKey = key.replace(/\[\]$/, '')
                      , prev = prevIn;

                // if our key does not have brackets and the same
                // key does not already exist on the tempQuery object
                if (newKey === key && isUndefined(prev[newKey])) {
                  prev[newKey] = query[key];
                } else {
                  prev[newKey] = [].concat(prev[newKey], query[key]);
                }

                return prev;
              }, {});

        // filter out undefinded from tempQuery arrays
        urlObject.query = Object.keys(tempQuery).reduce((prevIn, key) => {
          const prev = prevIn;

          if (Array.isArray(tempQuery[key])) {
            prev[key] = tempQuery[key].filter((element) => {
              return isDefined(element);
            });
          } else {
            prev[key] = tempQuery[key];
          }

          return prev;
        }, {});

        return urlObject;
      };

module.exports = parse;
