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
            ]

        , mergeObject = (obj, mergeInto) => {
            Object.keys(obj).forEach((item) => {
                if (item !== 'server' && typeof obj[item] === 'object' && !Array.isArray(obj[item])) {
                    if (typeof mergeInto[item] === 'undefined') {
                        mergeInto[item] = {};
                    }

                    mergeObject(obj[item], mergeInto[item]);
                } else {
                    if (pathKeyNames.indexOf(item) >= 0) {
                        mergeInto[item] = path.join(process.cwd(), obj[item]);
                    } else {
                        mergeInto[item] = obj[item];
                    }
                }
            });
        };


        if (typeof key === 'object') {
            mergeObject(key, configStore);
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
