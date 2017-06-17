'use strict';

const etag = require('etag')
      , fs = require('fs')
      , events = require('harken')

      , not = require('./tools').not
      , isDefined = require('./tools').isDefined

      , files = {}

      , addEtag = (fileIn) => {
        fs.readFile(fileIn, (err, data) => {
          if (err) {
            events.emit('error', { message: 'could not read file', error: err, file: fileIn });
          } else {
            files[fileIn] = etag(data);
            console.log('ETAG: ', files[fileIn]);
            events.emit(`etag:get:${fileIn}`, files[fileIn]);
          }
        });
      }

      , isValid = (etagObj, etagged) => {
        return isDefined(etagObj.etag)
            && etagged
            && files[etagObj.file] === etagObj.etag;
      }

      , checkEtag = (etagObj) => {
        const etagged = isDefined(files[etagObj.file])
              , valid = isValid(etagObj, etagged);

        // if the file hasn't been etagged then etag it
        if (not(etagged)) {
          addEtag(etagObj.file);
        } else {
          events.emit(`etag:get:${etagObj.file}`, files[etagObj.file]);
        }

        events.emit(`etag:check:${etagObj.file}`, valid);
      };

events.on('etag:check', checkEtag);
events.on('etag:add', addEtag);
events.on('etag:update', addEtag);
