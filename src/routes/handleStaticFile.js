

const fs = require('fs')
      , events = require('harken')
      , zlib = require('zlib')
      , brotli = require('iltorb')
      , mime = require('mime')

      , getCompression = require('../utils').getCompression

      , not = require('../utils').not
      , unmodifiedStatus = 304
      , succesStatus = 200

      , compressionExtension = (type) => {
        if (type === 'br') {
          return 'brot';
        } else if (type === 'deflate') {
          return 'def';
        } else {
          return 'tgz';
        }
      }

      , getCompressor = (type) => {
        if (type === 'br') {
          return brotli.compressStream();
        } else if (type === 'deflate') {
          return zlib.createDeflate();
        } else {
          return zlib.createGzip();
        }
      }

      , streamFile = (compression, file, connection) => {
        const extension = compressionExtension(compression)
              , compressor = getCompressor(compression);

        fs.stat(`${file}.${extension}`, (err, exists) => {
          if (!err && exists.isFile()) {
            fs.createReadStream(`${file}.${extension}`).pipe(connection.res);
          } else {
            // no compressed file yet...
            fs.createReadStream(file).pipe(compressor)
              .pipe(connection.res);

            fs.createReadStream(file).pipe(compressor)
              .pipe(fs.createWriteStream(`${file}.${extension}`));
          }
        });
      };

module.exports = (file, connection, config) => {
  const req = connection.req
        , res = connection.res
        , pathname = connection.path.pathname
        , compression = getCompression(req.headers['accept-encoding'], config)
        , expires = new Date().getTime()
        , maxAge = config.maxAge;

  fs.stat(file, (err, exists) => {
    if (!err && exists.isFile()) {
      events.required([ `etag:check:${file}`, `etag:get:${file}` ], (valid) => {
        if (valid[0]) { // does the etag match? YES
          res.statusCode = unmodifiedStatus;
          return res.end();
        }
        // No match...
        res.setHeader('ETag', valid[1]); // the etag is item 2 in the array

        if (req.method.toLowerCase() === 'head') {
          res.writeHead(succesStatus, {
            'Content-Type': mime.getType(pathname)
            , 'Cache-Control': `maxage=${maxAge}`
            , Expires: new Date(expires + maxAge).toUTCString()
            , 'Content-Encoding': compression
          });

          res.end();
          events.emit('static:headed', pathname);
        } else if (not(compression === 'none')) {
          // we have compression!
          res.writeHead(succesStatus, {
            'Content-Type': mime.getType(pathname)
            , 'Cache-Control': `maxage=${maxAge}`
            , Expires: new Date(expires + maxAge).toUTCString()
            , 'Content-Encoding': compression
          });

          streamFile(compression, file, connection);
          events.emit('static:served', pathname);
        } else {
          // no compression carry on...
          // return with the correct heders for the file type
          res.writeHead(succesStatus, {
            'Content-Type': mime.getType(pathname)
            , 'Cache-Control': `maxage=${maxAge}`
            , Expires: new Date(expires + maxAge).toUTCString()
          });

          fs.createReadStream(file).pipe(res);
          events.emit('static:served', pathname);
        }
      });
      events.emit('etag:check', { file: file, etag: req.headers['if-none-match'] });
    } else {
      events.emit('static:missing', pathname);
      events.emit('error:404', connection);
    }
  });
};
