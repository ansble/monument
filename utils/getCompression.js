var tools = require('./tools')
    , getCompression = function (header, config) {
        'use strict';

        if(tools.not(tools.isDefined(header)) || (tools.isDefined(config.compress) && !config.compress)){
           return 'none';
        } else if (header.match(/\bgzip\b/)) {
            return 'gzip';
        } else if (header.match(/\bdeflate\b/)) {
            return 'deflate';
        } else {
            return 'none';
        }
    };

module.exports = getCompression;
