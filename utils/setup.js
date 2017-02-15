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

    , compileTemplates = (config) => {
        // configure dotjs
        if (config.templating.options) {
            Object.keys(config.templating.options).forEach((opt) => {
                config.templating.engine.templateSettings[opt] = config.templating.options[opt];
            });
        }

        if (config.templating.preCompile) {
            // compile the templates
            config.templating.engine.process({ path: config.templating.path });
        }

        events.emit('setup:templates');
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
