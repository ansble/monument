'use strict';

const getRawBody = require('raw-body')
    , typer = require('media-typer')
    , querystring = require('querystring')
    , events = require('harken')
    , tools = require('./tools')

    , parseForm = (formString) => {
        const keys  = formString.match(/(name=")([^"]+)(")([^a-zA-Z0-9]+)([^-]+)/g);

        if (keys !== null) {
            return keys.reduce((prev, current) => {
                const temp = current.match(/(")([^"])+/);

                prev[temp[0].replace(/"/g, '')] = current.match(/([\s].+)/)[0].replace(/^[\s]/, '');

                return prev;
            }, {});
        } else {
            return {};
        }
    }

    , parser = (connection, callback, scope) => {//parse out the body
        let encoding = 'UTF-8';

        if(tools.isDefined(connection.req.headers['content-type'])){
            encoding = typer.parse(connection.req.headers['content-type']).parameters.charset || 'UTF-8';
        }

        getRawBody(connection.req, {
            length: connection.req.headers['content-length'],
            limit: '1mb',
            encoding: encoding
          }, (err, string) => {

            if (err){
                events.emit('error:parse', err);
                callback.apply(scope, [null, err]);
            }

            if(connection.req.headers['content-type'] === 'application/json'){
              try{
                callback.apply(scope, [JSON.parse(string)]);
              } catch (e) {
                events.emit('error:parse', e);
                callback.apply(scope, [null, e]);
              }
            } else if (connection.req.headers['content-type'] === 'application/x-www-form-urlencoded'){
              callback.apply(scope, [querystring.parse(string)]);
            } else {
                try{
                    callback.apply(scope, [JSON.parse(string)]);
                } catch (e) {
                    callback.apply(scope, [parseForm(string)]);
                }
            }
        });
    };

module.exports = parser;
