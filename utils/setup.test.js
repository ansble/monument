'use strict';

const test = require('ava')
      , setup = require('./setup')
      , events = require('harken')
      , fs = require('fs')
      , path = require('path')
      , dot = require('dot');

test.cb('compile Tests::should allow to change dot template settings', (t) => {
  const config = {
    dotjs: {
      append: false
    }
  };

  setup.templates(config);
  t.is(dot.templateSettings.append, false);
  config.dotjs.append = true; // reset default
  setup.templates(config);
  t.is(dot.templateSettings.append, true);
  t.end();
});

test('should be an object of setup functions', (t) => {
  t.is(typeof setup, 'object');
  t.is(typeof setup.compressed, 'function');
  t.is(typeof setup.templates, 'function');
  t.is(typeof setup.etags, 'function');
});

test.cb('should setup listeners for etags', (t) => {
  events.once('setup:etags', () => {
    t.is(true, true);
    t.end();
  });

  setup.etags();
});

test.cb('Delete Old Compressed Files::should setup templates', (t) => {
  fs.writeFileSync('./test_stubs/deletes/old.js.tgz', '//this is js', 'utf8');
  fs.writeFileSync('./test_stubs/deletes/old.js.def', '//this is js', 'utf8');

  events.required([
    'setup:compressed'
    , 'setup:delete:./test_stubs/deletes/old.js.tgz'
    , 'setup:delete:./test_stubs/deletes/old.js.def'
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

    t.is(pass[0], true);
    t.is(pass[1], true);
    t.end();
  });

  setup.compressed({
    publicPath: './test_stubs/deletes'
    , log: {
      info: () => {}
    }
  });
});
