var getRawBody = require('raw-body')
  , typer = require('media-typer')
  , querystring = require('querystring')
  , events = require('../emitter')

  , parseForm = function (formString) {
    'use strict';

    var rtnObj = {}
      , keys  = formString.match(/(name=")([^"]+)(")([^a-zA-Z0-9]+)([^-]+)/g);

    if(keys !== null){
      keys.forEach(function (item) {
        var temp = item.match(/(")([^"])+/);
        rtnObj[temp[0].replace(/"/g, '')] = item.match(/([\s].+)/)[0].replace(/^[\s]/, '');
      });
    }

    return rtnObj;
  }

  , parser = function (connection, callback, scope) {//parse out the body
    'use strict';
    var encoding = 'UTF-8';

    if(typeof connection.req.headers['content-type'] !== 'undefined'){
        encoding = typer.parse(connection.req.headers['content-type']).parameters.charset || 'UTF-8';
    }

    getRawBody(connection.req, {
        length: connection.req.headers['content-length'],
        limit: '1mb',
        encoding: encoding
      }, function (err, string) {

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
