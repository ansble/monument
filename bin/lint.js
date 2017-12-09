#!/usr/bin/env node

const eslint = require('eslint')
      , CLIEngine = eslint.CLIEngine
      , linter = new CLIEngine({
        useEslintrc: true,
      })
      , report = linter.executeOnFiles([
        './src/utils/**/*.js'
        , '!./src/utils/**/*.test.js'
        , './src/routes/**/*.js'
        , '!./src/routes/**/*.test.js'
        , './src/security/**/*.js'
        , '!./src/security/**/*.test.js'
        , './src/web-sockets/**/*.js'
        , '!./src/web-sockets/**/*.test.js'
        , './src/*.js'
        , '!./src/*.test.js'
      ])
      , formatter = linter.getFormatter()
      , errorCheck = (errorCount, file) => {
        return errorCount + file.errorCount;
      };

console.log(formatter(report.results));

if (report.results.reduce(errorCheck, 0) > 0) {
  process.exit(1);
}
