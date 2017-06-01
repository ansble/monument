'use strict';

const glob = require('glob')
    , fs = require('fs')
    , events = require('harken')

    , deleteCompressed = (config) => {
        // run through and delete all the compressed files in the file system
        const complete = events.required([ 'cleanup:compressed:start' ], () => {
                events.emit('setup:compressed');
            })
            , compressedFileGlobs = [
                `${config.publicPath}/**/*.tgz`
                , `${config.publicPath}/**/*.def`
                , `${config.publicPath}/**/*.brot`
            ];

        compressedFileGlobs.forEach((fileGlob) => {
            glob(fileGlob, (er, files) => {
                files.forEach((file) => {
                    const fileEvent = `setup:delete:${file}`;

                    complete.add(fileEvent);

                    fs.unlink(file, () => {
                        events.emit(fileEvent);
                    });
                });
            });
        });

        console.log('Cleaned up old compressed files...');
        events.emit('cleanup:compressed:start');
    }

    , checkForDot = (engine) => {
        return typeof engine.version === 'string' &&
            typeof engine.templateSettings === 'object' &&
            typeof engine.template === 'function' &&
            typeof engine.compile === 'function' &&
            typeof engine.encodeHTMLSource === 'function' &&
            typeof engine.process === 'function' &&
            typeof engine.log === 'boolean';
    }

    , compileTemplates = (config) => {
        // TODO: make preCompile a function that is passed in or... a flag for common types
        //  that way we don't have to expand this to handle every type of template out there
        //  and users can create custom handling for the result of precompile if they want
        const isDot = checkForDot(config.templating.engine);

        let templateObject;

        // configure dotjs
        if (config.templating.options && isDot) {
            Object.keys(config.templating.options).forEach((opt) => {
                config.templating.engine.templateSettings[opt] = config.templating.options[opt];
            });
        }

        if (config.templating.preCompile || isDot) {
            // compile the templates
            if (isDot) {
                config.templating.engine.process({ path: config.templating.path });
            } else if (typeof config.templating.preCompile === 'function') {
                templateObject = config.templating.preCompile(config.templating.engine, config.templating.path);
            }
        }

        events.emit('setup:templates', templateObject);
    }

    , etagSetup = () => {
        // set up the etag listeners and emitters
        require('./staticFileEtags');

        events.emit('setup:etags');
        console.log('etags setup...');
    };

module.exports = {
    compressed: deleteCompressed
    , templates: compileTemplates
    , etags: etagSetup
};
