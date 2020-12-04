'use strict';

const test = require('ava')
      , stream = require('stream')
      , path = require('path')
      , events = require('harken')
      , handleStaticFile = require('./handleStaticFile')
      , getConnectionMock = (method, pathname) => {
        const mock = {
          req: {
            method: method
            , headers: {
              'accept-encoding': '*'
              , 'if-none-match': '*'
            }
          }
          , res: new stream.Writable()
          , query: ''
          , params: {}
          , path: {
            pathname: pathname
          }
        };

        mock.res.writeHead = () => {};
        mock.res.setHeader = () => {};
        /* eslint-disable no-underscore-dangle */
        mock.res._write = () => {};
        /* eslint-enable no-underscore-dangle */

        return mock;
      }
      , withPath = (filePath) => {
        return path.join(process.cwd(), 'test_stubs/static', filePath);
      };

require('../utils/staticFileEtags');

test.cb('should handle a static file', (t) => {
  const connectionMock = getConnectionMock('GET', 'main.js');

  events.once('static:served', (name) => {
    t.is(name, connectionMock.path.pathname);
    t.end();
  });

  handleStaticFile(withPath('example.js'), connectionMock, {
    maxAge: 1000
    , compress: false
  });
});

test.cb('should handle the HEAD to a static file', (t) => {
  const connectionMock = getConnectionMock('HEAD', 'main.js');

  events.once('static:headed', (name) => {
    t.is(name, connectionMock.path.pathname);
    t.end();
  });

  handleStaticFile(withPath('default.js'), connectionMock, { maxAge: 1000, compress: false });
});

test.cb('should give 404 for static files missing', (t) => {
  const connectionMock = getConnectionMock('GET', 'nonExistingfile.jpg');

  events.once('static:missing', (name) => {
    t.is(name, connectionMock.path.pathname);
  });

  events.once('error:404', (connectionObject) => {
    t.is(connectionObject.req.method, 'GET');
    t.is(connectionObject.path.pathname, 'nonExistingfile.jpg');
    t.end();
  });
  handleStaticFile('nonExistingfile.jpg', connectionMock, { maxAge: 1000, compress: false });
});

test.cb('should give 404 for root route to page given for static files', (t) => {
  const connectionMock = getConnectionMock('GET', '/');

  events.once('static:missing', (name) => {
    t.is(name, connectionMock.path.pathname);
  });

  events.once('error:404', (connectionObject) => {
    t.is(connectionObject.req.method, 'GET');
    t.is(connectionObject.path.pathname, '/');
    t.end();
  });
  handleStaticFile('/', connectionMock, { maxAge: 1000, compress: false });
});

test.cb('should give 404 for pathname to website given for static files', (t) => {
  const connectionMock = getConnectionMock('GET', '/index.html');

  events.once('static:missing', (name) => {
    t.is(name, connectionMock.path.pathname);
  });

  events.once('error:404', (connectionObject) => {
    t.is(connectionObject.req.method, 'GET');
    t.is(connectionObject.path.pathname, '/index.html');
    t.end();
  });
  handleStaticFile('/index.html', connectionMock, { maxAge: 1000, compress: false });
});