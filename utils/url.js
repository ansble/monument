// replacement for node's built-in 'url.parse' that safely removes the square brackets
// supports only parseQueryString = true therefore does not accept that argument
const url = require('url')
    , tools = require('./tools')

    , parse = (urlStr, slashesDenoteHost) => {
        let urlObject = url.parse(urlStr, true, slashesDenoteHost)
            , query = urlObject.query
            , tempQuery = {}
            , newQuery = {}
            , not = tools.not
            , isDefined = tools.isDefined;

        Object.keys(urlObject.query).forEach((key) => {
            var newKey = key.replace(/\[\]$/, '');

            // if our key does not have brackets and the same
            // key does not already exist on the tempQuery object
            if (newKey === key && not(isDefined(tempQuery[newKey]))) {
                tempQuery[newKey] = query[key];
            }
            else {
                tempQuery[newKey] = [].concat(tempQuery[newKey], query[key]);
            }
        });

        // filter out undefinded from tempQuery arrays
        Object.keys(tempQuery).forEach((key) => {
            if (Array.isArray(tempQuery[key])){
                newQuery[key] = tempQuery[key].filter((element) => {
                    return isDefined(element);
                });
            }
            else {
                newQuery[key] = tempQuery[key];
            }
        });

        urlObject.query = newQuery;
        return urlObject;
    };

module.exports = parse;
