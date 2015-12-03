'use strict';

const gulp = require('gulp')
    , mocha = require('gulp-mocha')
    , minimist = require('minimist')
    , cp = require('child_process')
    , chalk = require('chalk')
    , fs = require('fs')
    , istanbul = require('gulp-istanbul')
    , coveralls = require('gulp-coveralls')
    , eslint = require('gulp-eslint')

    , pkg = require('./package.json')

    , knownOptions = {
        string: 'type'
        , default: { type: 'patch' }
    }

    , incrementVersion = (version, type) => {
        const versionArr = version.split('.');

        if (type === 'major') {
            versionArr[0] = parseInt(versionArr[0], 10) + 1;
            versionArr[1] = 0;
            versionArr[2] = 0;
        } else if (type === 'minor') {
            versionArr[1] = parseInt(versionArr[1], 10) + 1;
            versionArr[2] = 0;
        } else {
            versionArr[2] = parseInt(versionArr[2], 10) + 1;
        }

        return versionArr.join('.');
    }

    , options = minimist(process.argv.slice(2), knownOptions);

gulp.task('default');

gulp.task('lint', () => {
    return gulp.src([ '**/*.js', '!node_modules/**/*', '!coverage/**/*', '!test_stubs/**/*' ])
        .pipe(eslint('./.eslintrc'))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', [ 'lint' ], () => {
    return gulp.src([
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
      // Right there
      .pipe(istanbul({ includeUntested: true }))
      .pipe(istanbul.hookRequire())
      .on('finish', () => {
          gulp.src([ '**/**_test.js', '!node_modules/**/*' ], { read: false })
            .pipe(mocha({ reporter: 'spec' }))
            .pipe(istanbul.writeReports())
            // Enforce a coverage of at least 80%
            .pipe(istanbul.enforceThresholds({ thresholds: { global: 80 } }));
      });
});

gulp.task('coveralls', () => {
    return gulp.src('coverage/**/lcov.info')
            .pipe(coveralls());
});

gulp.task('release', [ 'test' ], () => {
    const newVersion = incrementVersion(pkg.version, options.type)
        , gitLogCommand = 'git log `git describe --tags --abbrev=0`..HEAD --pretty=format:"  - %s"';

    // this is the task to automat most of the release stuff... because it is lame and boring
    console.log(`\n\nPreparing for a ${chalk.bgGreen.bold(options.type)} release...\n\n`);


    cp.exec(gitLogCommand, (err, stdout) => {
        const history = fs.readFileSync('./history.md')
            , historyHeader = `### - ${newVersion} * ${new Date().toLocaleString()} *\n\n`;

        console.log('Updating the history.md file');

        fs.writeFile('./history.md', `${historyHeader} ${stdout} \n\n\n ${history}`);

        cp.exec('git log --all --format="%aN <%aE>" | sort -u', (errLog, stdoutLog) => {
            // write out the Authors file with all contributors
            console.log('Updating the AUTHORS file');

            fs.writeFileSync('./AUTHORS', stdoutLog);

            cp.exec('git add .', () => {
                cp.exec(`git commit -m "preparing for release of v${newVersion}"`, () => {
                    console.log('commited the automated updates');
                    // run npm version
                    cp.exec(`npm version ${options.type}`, () => {
                        console.log('npm version to rev for release');
                        cp.exec('npm publish', () => {
                            console.log('pushing to origin');

                            cp.exec('git push origin master', Function.prototype);
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
});

// so we can test the gulpfile
if (typeof exports !== 'undefined') {
    exports.incrementVersion = incrementVersion;
}
