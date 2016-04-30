'use strict';

const isDefined = require('./tools').isDefined
    , isUndefined = require('./tools').isUndefined
    , dontCompress = (config) => {
        return isDefined(config.compress) && !config.compress;
    }

    , supportsBrotli = (header) => {
        return header.match(/\bbr\b/) || header.match(/\bbrotli\b/);
    }

    , supportsGzip = (header) => {
        return header.match(/\bgzip\b/);
    }

    , supportsDeflate = (header) => {
        return header.match(/\bdeflate\b/);
    }

    , getCompression = (header, config) => {
        if (isUndefined(header) || dontCompress(config)) {
            return 'none';
        } else if (supportsBrotli(header)) {
            return 'br';
        } else if (supportsGzip(header)) {
            return 'gzip';
        } else if (supportsDeflate(header)) {
            return 'deflate';
        } else {
            return 'none';
        }
    };

module.exports = getCompression;
module.exports.supportsBrotli = supportsBrotli;
