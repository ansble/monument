/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , subject = require('./index')

    , serverStub = require('../test_stubs/server_stub');

let webSocketServer;

describe('WebSocket Tests', () => {
    beforeEach(() => {
        webSocketServer = subject(serverStub);
    });

    it('should initialize a websocket server');
    it('should respond to data events');
    it('should allow one way passage of non get/set events');
});
