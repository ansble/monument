'use strict';

const gulp = require('gulp')
    , mocha = require('gulp-mocha')
    , istanbul = require('gulp-istanbul')
    , coveralls = require('gulp-coveralls')

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
    };

gulp.task('test', () => {
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

// so we can test the gulpfile
if (typeof exports !== 'undefined') {
    exports.incrementVersion = incrementVersion;
}
