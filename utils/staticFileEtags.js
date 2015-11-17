'use strict';

const etag = require('etag')
    , fs = require('fs')
    , tools = require('./tools')
    , events = require('harken')
    , files = {}

    , addEtag = (fileIn) => {

        fs.readFile(fileIn, (err, data) => {
            if (err){
                events.emit('error', { message: 'could not read file', error: err, file: fileIn });
            } else {
                files[fileIn] = etag(data);
                events.emit(`etag:get:${fileIn}`, files[fileIn]);
            }
        });
    }

    , isValid = (etagObj, etagged) => {
        return tools.isDefined(etagObj.etag)
            && etagged
            && files[etagObj.file] === etagObj.etag;
    }

    , checkEtag = (etagObj) => {

        const etagged = tools.isDefined(files[etagObj.file])
            , valid = isValid(etagObj, etagged);

        // if the file hasn't been etagged then etag it
        if (tools.not(etagged)){
            addEtag(etagObj.file);
        } else {
            events.emit(`etag:get:${etagObj.file}`, files[etagObj.file]);
        }

        events.emit(`etag:check:${etagObj.file}`, valid);
    };

events.on('etag:check', checkEtag);
events.on('etag:add', addEtag);
events.on('etag:update', addEtag);
