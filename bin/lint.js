#!/usr/bin/env node
'use strict';

const eslint = require('eslint')
      , CLIEngine = eslint.CLIEngine
      , linter = new CLIEngine({
        useEslintrc: true,
      })
      , report = linter.executeOnFiles([
        './utils/**/*.js'
        , '!./utils/**/*_test.js'
        , './routes/**/*.js'
        , '!./routes/**/*_test.js'
        , './security/**/*.js'
        , '!./security/**/*_test.js'
        , './web-sockets/**/*.js'
        , '!./web-sockets/**/*_test.js'
        , '*.js'
        , '!*_test.js'
        , '!gulpfile.js' ])
      , formatter = linter.getFormatter()
      , errorCheck = (errorCount, file) => {
        return errorCount + file.errorCount;
      };

console.log(formatter(report.results));

if (report.results.reduce(errorCheck, 0) > 0) {
  process.exit(1);
}
