/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
  , setup = require('./setup')
  , events = require('harken')
  , fs = require('fs')
  , path = require('path');

describe('setup Tests', () => {

    it('should be an object of setup functions', () => {
        assert.isObject(setup);
        assert.isFunction(setup.compressed);
        assert.isFunction(setup.templates);
        assert.isFunction(setup.etags);
    });

    it('should setup listeners for etags', (done) => {
        events.once('setup:etags', () => {
            assert.strictEqual(true, true);
            done();
        });

        setup.etags();
    });

    describe('Delete Old Compressed Files', () => {
        it('should setup templates', (done) => {
            fs.writeFileSync('./test_stubs/deletes/old.js.tgz', '//this is js', 'utf8');
            fs.writeFileSync('./test_stubs/deletes/old.js.def', '//this is js', 'utf8');

            events.required([
                'setup:compressed'
                , 'setup:delete:' + path.join(process.cwd(), './test_stubs/deletes/old.js.tgz')
                , 'setup:delete:' + path.join(process.cwd(), './test_stubs/deletes/old.js.def')
            ], () => {
                const pass = [ false, false ];

                try {
                    fs.statSync(path.join(process.cwd(), './test_stubs/deletes/old.js.tgz'));
                } catch (e) {
                    pass[0] = true;
                }

                try {
                    fs.statSync(path.join(process.cwd(), './test_stubs/deletes/old.js.def'));
                } catch (e) {
                    pass[1] = true;
                }

                assert.strictEqual(pass[0], true);
                assert.strictEqual(pass[1], true);
                done();
            });

            setup.compressed({ publicPath: './test_stubs/deletes' });
        });
    });
});
