var getRawBody = require('raw-body')
  , typer = require('media-typer')
  , querystring = require('querystring')
  , events = require('../emitter')

  , parseForm = function (formString) {
    'use strict';

    var rtnObj = {}
      , keys  = formString.match(/([\n\r].+)/g) //formString.match(/(form-data; name=['"])([^"']+)/g)
      , currentName;

    if(keys !== null){
      keys.forEach(function (item) {
        var name = item.match(/(form-data; name=['"])([^"']+)/);
        if (name) {
          //this is a key
          currentName = name[0].replace(/form-data; name=['"]/, '');
        } else if (!item.match(/FormBoundary/ && typeof currentName !== 'undefined')) {
          //this is a value
          rtnObj[currentName] = item.replace(/[\n]/,'');
        }
      });
    } else {
      rtnObj = querystring.parse(formString);
    }

    return rtnObj;
  }

  , parser = function (connection, callback, scope) {//parse out the body
    'use strict';

    getRawBody(connection.req, {
        length: connection.req.headers['content-length'],
        limit: '1mb',
        encoding: typer.parse(connection.req.headers['content-type']).parameters.charset || 'UTF-8'
      }, function (err, string) {
        if (err){
          events.emit('error:parse', err);
          return err;
        }

        try{
          callback.apply(scope, [JSON.parse(string)]);
        } catch (e) {
          console.log(e, string);
          callback.apply(scope, [parseForm(string)]);
        }
    });
  };

module.exports = parser;
