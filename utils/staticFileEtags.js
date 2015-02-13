var etag = require('etag')
	, fs = require('fs')
	, emitter = require('../emitter')
	, files = {}

	, checkEtag = function (etagObj) {
		var valid = typeof etagObj.etag !== 'undefined' && (typeof files[etagObj.file] !== 'udefined') && (files[etagObj.file] === etagObj.etag);
		
		emitter.emit('etag:check:' + etagObj.file, valid);
	}

	, addEtag = function (fileIn) {
		fs.readFile(fileIn, function (err, data) {
			if(err){
				emitter.emit('error', {message: 'could not read file', error: err, file: fileIn});
			}

			files[fileIn] = etag(data);
		});
	};

emitter.on('etag:check', checkEtag);
emitter.on('etag:add', addEtag);
emitter.on('etag:update', addEtag);