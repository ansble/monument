/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
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
        return mock;
      }
      , withPath = (filePath) => {
        return path.join(process.cwd(), 'test_stubs/templates', filePath);
      };

describe('handleStaticFile Tests', () => {
  beforeEach(() => {
    events.off('static:served');
    events.off('static:headed');
    events.off('static:missing');
    events.off('error:404');
  });

  it('should handle a static file', (done) => {
    const connectionMock = getConnectionMock('GET', 'main.js');

    events.once('static:served', (name) => {
      assert.equal(name, connectionMock.path.pathname);
      done();
    });
    handleStaticFile(withPath('example.js'), connectionMock, {
      maxAge: 1000
      , compress: false
    });
  });

  it('should handle the HEAD to a static file', (done) => {
    const connectionMock = getConnectionMock('HEAD', 'main.js');

    events.once('static:headed', (name) => {
      assert.equal(name, connectionMock.path.pathname);
      done();
    });
    handleStaticFile(withPath('example.js'), connectionMock, { maxAge: 1000, compress: false });
  });

  it('should give 404 for static files missing', (done) => {
    const connectionMock = getConnectionMock('GET', 'nonExistingfile.jpg');

    events.once('static:missing', (name) => {
      assert.equal(name, connectionMock.path.pathname);
    });
    events.once('error:404', (connectionObject) => {
      assert.equal(connectionObject.req.method, 'GET');
      assert.equal(connectionObject.path.pathname, 'nonExistingfile.jpg');
      done();
    });
    handleStaticFile('nonExistingfile.jpg', connectionMock, { maxAge: 1000, compress: false });
  });
});
