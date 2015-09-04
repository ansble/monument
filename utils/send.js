var etag = require('etag')
    , getCompression = require('./getCompression')
    , zlib = require('zlib')
    , tools = require('./tools')
    , not = tools.not
    , isDefined = tools.isDefined;

module.exports = function(req, config){
    'use strict';

    return function (data) {
        var that = this
            , type = typeof data
            , isBuffer = Buffer.isBuffer(data)
            , encoding = 'utf8'
            , reqEtag
            , compression = getCompression(req.headers['accept-encoding'], config);

        if (not(isDefined(data))){
          //handle empty bodies... as strings
            that.setHeader('Content-Type', 'text/plain');
            data = '';
            type = 'string';

        } else if (type === 'string') {
                that.setHeader('Content-Type', 'text/html');

        } else if(typeof data === 'object'){
            //this is JSON send it and end it
            that.setHeader('Content-Type', 'application/json');

            if(!isBuffer){
                data = JSON.stringify(data);

            } else {
                that.setHeader('Content-Type', 'text/html');
                data = data.toString();
            }
        } else {
            data = JSON.stringify(data);
        }

        reqEtag = etag(data);

        if(isDefined(req.headers['if-none-match']) && req.headers['if-none-match'] === reqEtag){
            that.statusCode = 304;
            that.end();
        } else {
            that.setHeader('ETag', reqEtag);

            if(compression !== 'none'){
                that.setHeader('Content-Encoding', compression);
            }

            if (compression === 'deflate'){
                that.end(zlib.deflateSync(data), encoding);
            } else if (compression === 'gzip'){
                that.end(zlib.gzipSync(data), encoding);
            } else {
                that.end(data, encoding);
            }
        }
    };
};
