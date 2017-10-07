'use strict';

const isDefined = require('./tools').isDefined
      , isUndefined = require('./tools').isUndefined
      , dontCompress = (config) => {
        return isDefined(config.compress) && !config.compress;
      }

      , supportsBrotli = (header = '') => {
        return header.match(/\bbr\b/) || header.match(/\bbrotli\b/);
      }

      , supportsGzip = (header = '') => {
        return header.match(/\bgzip\b/);
      }

      , supportsDeflate = (header = '') => {
        return header.match(/\bdeflate\b/);
      }

      , supportsCompression = (header = '') => {
        if (supportsBrotli(header)) {
          return 'br';
        } else if (supportsGzip(header)) {
          return 'gzip';
        } else if (supportsDeflate(header)) {
          return 'deflate';
        }

        return 'none';
      }

      , getCompression = (header, config) => {
        const supported = header ? supportsCompression(header) : 'none';

        if (isUndefined(header) || dontCompress(config) || supported === 'none') {
          return 'none';
        } else {
          return supported;
        }
      };

module.exports = getCompression;
module.exports.supportsBrotli = supportsBrotli;
