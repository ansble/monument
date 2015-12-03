'use strict';

const tools = require('./tools')
    , dontCompress = (config) => {
        return tools.isDefined(config.compress) && !config.compress;
    }

    , getCompression = (header, config) => {
        if (tools.isUndefined(header) || dontCompress(config)){
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
