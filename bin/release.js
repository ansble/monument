#!/usr/bin/env node
'use strict';
const minimist = require('minimist')
      , cp = require('child_process')
      , fs = require('fs')
      , chalk = require('chalk')
      , knownOptions = {
        string: 'type'
        , default: { type: 'patch' }
      }
      , options = minimist(process.argv.slice(2), knownOptions)
      , incrementVersion = require('./increment.js')
      , pkg = require('../package.json')
      , newVersion = incrementVersion(pkg.version, options.type)
      , gitLogCommand = 'git log `git describe --tags --abbrev=0`..HEAD --pretty=format:"  - %s"';

// this is the task to automat most of the release stuff... because it is lame and boring
console.log(`\n\nPreparing for a ${chalk.bgGreen.bold(options.type)} release...\n\n`);


cp.exec(gitLogCommand, (err, stdout) => {
  const history = fs.readFileSync('./history.md')
        , authors = fs.readFileSync('./AUTHORS').toString().split('\n')
        , historyHeader = `### - ${newVersion} * ${new Date().toLocaleString()} *\n\n`;

  console.log('Updating the history.md file');

  fs.writeFile('./history.md', `${historyHeader} ${stdout} \n\n\n ${history}`);

  cp.exec('git log --all --format="%aN <%aE>" | sort -u', (errLog, stdoutLog) => {
    const newAuthors = [].concat(authors, stdoutLog.split('\n')).reduce((accum, author) => {
      if (accum.indexOf(author) < 0) {
        accum.push(author);
      }

      return accum;
    }, []);

    // write out the Authors file with all contributors
    console.log('Updating the AUTHORS file');

    fs.writeFileSync('./AUTHORS', newAuthors.join('\n'));

    cp.exec('git add .', () => {
      cp.exec(`git commit -m "preparing for release of v${newVersion}"`, () => {
        console.log('commited the automated updates');
        // run npm version
        cp.exec(`npm version ${options.type}`, () => {
          console.log('npm version to rev for release');
          cp.exec('npm publish', () => {
            console.log('pushing to origin');

            cp.exec('git push origin HEAD', Function.prototype);
            cp.exec(`git push origin v${newVersion}`, (errPush) => {
              if (errPush) {
                console.log(errPush);
              }
              console.log(chalk.green('DONE! Congrats on the Release!'));
            });
          });
        });
      });
    });
  });
});
