#!/usr/bin/env node
'use strict';

const eslint = require('eslint')
      , CLIEngine = eslint.CLIEngine
      , linter = new CLIEngine({
        useEslintrc: true,
      })
      , report = linter.executeOnFiles([
        './components/**/*.js'
        , '!./components/**/*.test.js'
        , '*.js'
        , '!*.test.js'
      ])
      , formatter = linter.getFormatter()
      , errorCheck = (errorCount, file) => {
        return errorCount + file.errorCount;
      };

console.log(formatter(report.results));

if (report.results.reduce(errorCheck, 0) > 0) {
  process.exit(1);
}
