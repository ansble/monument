

const getRawBody = require('raw-body'),
      typer = require('media-typer'),
      querystring = require('querystring'),
      events = require('harken'),
      isDefined = require('./tools').isDefined,
      parseForm = require('./parseForm'),
      os = require('os'),
      fs = require('fs'),
      path = require('path'),
      Busboy = require('busboy'),
      fileParser = (connection, callback, options) => {
  const form = {},
        scope = options ? options.scope : null,
        busboy = new Busboy({ headers: connection.req.headers });

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {

    file.pipe(fs.createWriteStream(path.join(os.tmpdir(), filename)));

    form[fieldname] = {
      tempFile: path.join(os.tmpdir(), filename),
      name: filename,
      encoding: encoding,
      mimetype: mimetype,
      file: file
    };
  });

  busboy.on('field', (fieldname, val) => {
    form[fieldname] = val;
  });

  busboy.on('finish', () => {
    callback.apply(scope, [form]);
  });

  connection.req.pipe(busboy);
},
      getCharset = contentType => {
  return typer.parse(contentType).parameters.charset || 'UTF-8';
},
      parser = (connection, callback, scopeIn) => {
  const contentType = connection.req.headers['content-type'] ? connection.req.headers['content-type'].split(';')[0] : 'application/json',
        scope = scopeIn,
        encoding = isDefined(contentType) ? getCharset(contentType) : 'UTF-8';

  if (contentType === 'multipart/form-data') {
    try {
      fileParser(connection, callback, { scope: scope });
    } catch (err) {
      callback.apply(scope, [null, err]);
    }
  } else {
    getRawBody(connection.req, {
      length: connection.req.headers['content-length'],
      limit: '1mb',
      encoding: encoding
    }, (err, string) => {

      if (err) {
        events.emit('error:parse', err);
        callback.apply(scope, [null, err]);
        return;
      }

      if (contentType === 'application/x-www-form-urlencoded') {
        callback.apply(scope, [querystring.parse(string)]);
        return;
      }

      try {
        callback.apply(scope, [JSON.parse(string)]);
      } catch (e) {
        if (contentType === 'application/json') {
          events.emit('error:parse', e);
          callback.apply(scope, [null, e]);
        } else {
          callback.apply(scope, [parseForm(string)]);
        }
      }
    });
  }
};

module.exports = parser;