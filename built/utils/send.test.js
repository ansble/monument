

const test = require('ava'),
      send = require('./send'),
      zlib = require('zlib'),
      brotli = require('iltorb'),
      etag = require('etag'),
      obj = {
  title: 'Tom Sawyer',
  Author: 'Samuel Langhorne Clemens'
},
      fakeRes = cb => {
  const fakeHeaders = {};

  return {
    setHeader: (key, value) => {
      fakeHeaders[key] = value;
    },
    end: data => {
      cb(data, fakeHeaders);
    },
    send: send({
      headers: {
        'accept-encoding': 'none',
        'if-none-match': ''
      }
    }, { compression: false }),
    sendDeflate: send({
      headers: {
        'accept-encoding': 'deflate',
        'if-none-match': ''
      }
    }, { compression: 'deflate' }),
    sendGzip: send({
      headers: {
        'accept-encoding': 'gzip',
        'if-none-match': ''
      }
    }, { compression: 'gzip' }),
    sendBrotli: send({
      headers: {
        'accept-encoding': 'br',
        'if-none-match': ''
      }
    }, { compression: 'br' }),
    sendEtag: send({
      headers: {
        'accept-encoding': 'none',
        'if-none-match': etag(JSON.stringify(obj))
      }
    }, { compression: false }),
    statusCode: 200
  };
};

let buf;

test.beforeEach(() => {
  buf = new Buffer('this is a buffer', 'utf8');
});

test('should be defined as a function', t => {
  t.is(typeof send, 'function');
});

test('should return a function', t => {
  t.is(typeof send({}, {}), 'function');
});

test.cb('should handle an empty data object', t => {
  fakeRes(out => {
    t.is(out, '');
    t.end();
  }).send();
});

test.cb('should handle a string', t => {
  fakeRes(out => {
    t.is(out, 'The Walrus is Paul');
    t.end();
  }).send('The Walrus is Paul');
});

test.cb('should handle an object', t => {
  fakeRes(out => {
    t.is(out, JSON.stringify(obj));
    t.end();
  }).send(obj);
});

test.cb('should handle a buffer', t => {
  fakeRes(out => {
    t.is(out, 'this is a buffer');
    t.end();
  }).send(buf);
});

test.cb('should handle an array', t => {
  fakeRes(out => {
    t.is(out, JSON.stringify(['one', 'two']));
    t.end();
  }).send(['one', 'two']);
});

test.cb('should handle a number and other weird data', t => {
  fakeRes(out => {
    t.is(out, '1');
    t.end();
  }).send(1);
});

test.cb('should handle a bool', t => {
  fakeRes(out => {
    t.is(out, JSON.stringify(true));
    t.end();
  }).send(true);
});

test.cb('should return deflate compressed results if deflate header is sent', t => {
  fakeRes((out, fakeHeaders) => {
    const outString = JSON.stringify(out),
          compareString = JSON.stringify(zlib.deflateSync(JSON.stringify(obj)));

    t.is(outString, compareString);
    t.is(fakeHeaders['Content-Encoding'], 'deflate');
    t.end();
  }).sendDeflate(obj);
});

test.cb('should return gzip compressed results if gzip header is sent', t => {
  fakeRes((out, fakeHeaders) => {
    const outString = JSON.stringify(out),
          compareString = JSON.stringify(zlib.gzipSync(JSON.stringify(obj)));

    t.is(outString, compareString);
    t.is(fakeHeaders['Content-Encoding'], 'gzip');
    t.end();
  }).sendGzip(obj);
});

test.cb('should return brotli compressed results if brotli header is sent', t => {
  fakeRes((out, fakeHeaders) => {
    const outString = JSON.stringify(out);

    brotli.compress(new Buffer(JSON.stringify(obj)), (err, compareString) => {
      t.is(outString, JSON.stringify(compareString));
      t.is(fakeHeaders['Content-Encoding'], 'br');
      t.end();
    });
  }).sendBrotli(obj);
});

test.cb('should return a 304 if the content has not changed', t => {
  const notModifiedStatus = 304,
        res = fakeRes(() => {
    t.is(res.statusCode, notModifiedStatus);
    t.end();
  });

  res.sendEtag(obj);
});