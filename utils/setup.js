'use strict';

const glob = require('glob')
    , fs = require('fs')
    , events = require('harken')
    , path = require('path')
    , dot = require('dot')

    , deleteCompressed = (config) => {
        //run through and delete all the compressed files in the file system
        let complete = events.required(['cleanup:compressed:start'], () => {
            events.emit('setup:compressed');
        });

        glob(path.join(process.cwd(), config.publicPath + '/**/*.tgz'), (er, files) => {
            files.forEach((file) => {
                complete.add('setup:delete:' + file);

                fs.unlink(file, () => {
                    events.emit('setup:delete:' + file);
                });
            });
        });

        glob(path.join(process.cwd(), config.publicPath + '/**/*.def'), (er, files) => {
            files.forEach((file) => {
                complete.add('setup:delete:' + file);

                fs.unlink(file, () => {
                    events.emit('setup:delete:' + file);
                });
            });
        });

        console.log('Cleaned up old compressed files...');
        events.emit('cleanup:compressed:start');
    }

    , compileTemplates = (config) => {
        let templatePath = config.templatePath || './templates';

        //configure dotjs
        if (config.dotjs) {
            Object.keys(config.dotjs).forEach((opt) => {
                dot.templateSettings[opt] = config.dotjs[opt];
            });
        }

        //compile the templates
        dot.process({path: path.join(process.cwd(), templatePath)});

        events.emit('setup:templates');
    }

  , etagSetup = () => {
      //set up the etag listeners and emitters
      require('./staticFileEtags');

      events.emit('setup:etags');
      console.log('etags setup...');
  };

module.exports  = {
    compressed: deleteCompressed
    , templates: compileTemplates
    , etags: etagSetup
};
