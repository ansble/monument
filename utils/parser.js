'use strict';

const getRawBody = require('raw-body')
    , typer = require('media-typer')
    , querystring = require('querystring')
    , events = require('harken')
    , isDefined = require('./tools').isDefined
    , parseForm = require('./parseForm')

    , parser = (connection, callback, scope) => { // parse out the body
        const contentType = connection.req.headers['content-type'];

        let encoding = 'UTF-8';

        if (isDefined(contentType)){
            encoding = typer.parse(contentType).parameters.charset || 'UTF-8';
        }

        getRawBody(connection.req, {
            length: connection.req.headers['content-length']
            , limit: '1mb'
            , encoding: encoding
        }, (err, string) => {

            if (err){
                events.emit('error:parse', err);
                callback.apply(scope, [ null, err ]);
                return;
            }

            if (contentType === 'application/x-www-form-urlencoded'){
                callback.apply(scope, [ querystring.parse(string) ]);
                return;
            }

            try {
                callback.apply(scope, [ JSON.parse(string) ]);
            } catch (e) {
                if (contentType === 'application/json') {
                    events.emit('error:parse', e);
                    callback.apply(scope, [ null, e ]);
                } else {
                    callback.apply(scope, [ parseForm(string) ]);
                }
            }
        });
    };

module.exports = parser;
