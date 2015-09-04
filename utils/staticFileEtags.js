var etag = require('etag')
	, fs = require('fs')
	, events = require('../emitter')
	, files = {}

	, addEtag = function (fileIn) {
		'use strict';

        fs.readFile(fileIn, function (err, data) {
            if(err){
                events.emit('error', {message: 'could not read file', error: err, file: fileIn});
            } else {
                files[fileIn] = etag(data);
    			events.emit('etag:get:' + fileIn, files[fileIn]);
            }
		});
	}

	, checkEtag = function (etagObj) {
		'use strict';

		var etagged = (typeof files[etagObj.file] !== 'undefined')
			, valid = typeof etagObj.etag !== 'undefined' && etagged && (files[etagObj.file] === etagObj.etag);

		//if the file hasn't been etagged then etag it
		if(!etagged){
			addEtag(etagObj.file);
		} else {
			events.emit('etag:get:' + etagObj.file, files[etagObj.file]);
		}

		events.emit('etag:check:' + etagObj.file, valid);
	};

events.on('etag:check', checkEtag);
events.on('etag:add', addEtag);
events.on('etag:update', addEtag);
