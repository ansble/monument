var etag = require('etag')
	, fs = require('fs')
	, emitter = require('../emitter')
	, files = {}

	, checkEtag = function (etagObj) {
		var etagged = (typeof files[etagObj.file] !== 'undefined')
			, valid = typeof etagObj.etag !== 'undefined' && etagged && (files[etagObj.file] === etagObj.etag);
		
		//if the file hasn't been etagged then etag it
		if(!etagged){
			addEtag(etagObj.file);
		} else {
			emitter.emit('etag:get:' + etagObj.file, files[etagObj.file]);
		}

		emitter.emit('etag:check:' + etagObj.file, valid);
	}

	, addEtag = function (fileIn) {
		fs.readFile(fileIn, function (err, data) {
			if(err){
				emitter.emit('error', {message: 'could not read file', error: err, file: fileIn});
			}

			files[fileIn] = etag(data);
			emitter.emit('etag:get:' + fileIn, files[fileIn]);
		});
	};

emitter.on('etag:check', checkEtag);
emitter.on('etag:add', addEtag);
emitter.on('etag:update', addEtag);