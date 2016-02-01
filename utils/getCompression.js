'use strict';

const isUndefined = require('./tools').isUndefined
    , dontCompress = (config) => {
        return !config.compress;
    }

    , getCompression = (header, config) => {
        if (isUndefined(header) || dontCompress(config)) {
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
