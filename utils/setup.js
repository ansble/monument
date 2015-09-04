var glob = require('glob')
	, fs = require('fs')
	, events = require('../emitter.js')
	, path = require('path')
	, dot = require('dot')

	, deleteCompressed = function (){
		'use strict';
		//run through and delete all the compressed files in the file system
		var complete = events.required(['cleanup:compressed:start'], function (){
			events.emit('setup:compressed');
		});

		glob(path.join(process.cwd(),'./public/**/*.tgz'), function (er, files) {

        files.forEach(function (file) {
				complete.add('setup:delete:' + file);
				fs.unlink(file, function () {
					events.emit('setup:delete:' + file);
				});
			});
		});

        glob(path.join(process.cwd(),'./public/**/*.def'), function (er, files) {

          files.forEach(function (file) {
            complete.add('setup:delete:' + file);
            fs.unlink(file, function () {
              events.emit('setup:delete:' + file);
            });
          });
        });

        console.log('Cleaned up old compressed files...');
		events.emit('cleanup:compressed:start');
	}

	, compileTemplates = function (config) {
		'use strict';

		var templatePath = config.templatePath || './templates';

		//configure dotjs
		if (config.dotjs) {
			Object.keys(config.dotjs).forEach(function (opt) {
				dot.templateSettings[opt] = config.dotjs[opt];
			});
		}

		//compile the templates
		dot.process({path: path.join(process.cwd(), templatePath)});

		events.emit('setup:templates');
	}

  , etagSetup = function (){
      'use strict';

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
