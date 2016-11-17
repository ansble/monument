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

        , webSockets: false
        , compress: true
        , etags: true

        , templating: {
            path: path.join(process.cwd(), './templates')
            , engine: require('dot')
            , options: {}
            , preCompile: true
        }

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
        const pathKeyNames = [
            'routeJSONPath'
            , 'routePath'
            , 'publicPath'
            , 'path'
        ];

        if (typeof key === 'object') {
            Object.keys(key).forEach((item) => {
                if (pathKeyNames.indexOf(item) >= 0) {
                    // TODO: may need to modify for templating object
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
