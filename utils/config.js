'use strict';

let configStore = {};

const path = require('path')
    , http = require('http')
    , cloneDeep = require('lodash.clonedeep')
    , defaults = {
        port: 3000
        , maxAge: 31536000

        , routePath: path.join(process.cwd(), './routes.json')
        , routeJSONPath: path.join(process.cwd(), './routes.json')
        , publicPath: path.join(process.cwd(), './public')
        , templatePath: path.join(process.cwd(), './templates')

        , webSockets: false
        , compress: true
        , etags: true

        , security: {
            xssProtection: true
            , poweredBy: undefined
            , noSniff: true
            , noCache: false
            , framegaurd: {
                action: 'SAMEORIGIN'
            }
            , hsts: {
                maxAge: 86400
            }
        }

        , server: http
    }

    , getConfig = (key) => {
        if (typeof key === 'string') {
            return configStore[key];
        } else {
            return configStore;
        }
    }

    , setDefaults = () => {
        configStore = cloneDeep(defaults);
    }

    , setConfig = (key, value) => {

        if (typeof key === 'object') {
            Object.keys(key).forEach((item) => {
                if (item === 'routeJSONPath' || item === 'routePath' || item === 'publicPath' || item === 'templatePath') {
                    configStore[item] = path.join(process.cwd(), key[item]);
                } else {
                    configStore[item] = key[item];
                }
            });
        } else if (typeof key === 'string') {
            configStore[key] = value;
        }

        return configStore;
    };

configStore = cloneDeep(defaults);

module.exports = {
    get: getConfig
    , set: setConfig
    , reset: () => {
          setDefaults();
      }
};
