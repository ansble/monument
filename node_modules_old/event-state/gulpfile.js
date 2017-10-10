'use strict';

var gulp = require('gulp')
    , mocha = require('gulp-mocha')
    , minimist = require('minimist')
    , cp = require('child_process')
    , chalk = require('chalk')
    , fs = require('fs')
    , istanbul = require('gulp-istanbul')

    , pkg = require('./package.json')

    , knownOptions = {
        string: 'type',
        default: { type: 'patch' }
    }

    , incrementVersion = function (version, type) {
        var versionArr = version.split('.');

        if(type === 'major'){
            versionArr[0] = parseInt(versionArr[0], 10) + 1;
        } else if (type === 'minor') {
            versionArr[1] = parseInt(versionArr[1], 10) + 1;
        } else {
            versionArr[2] = parseInt(versionArr[2], 10) + 1;
        }

        return versionArr.join('.');
    }

    , options = minimist(process.argv.slice(2), knownOptions);

gulp.task('default', function(){

});

gulp.task('pre-test', function () {
  return gulp.src(['**/*.js', '!node_modules/**/*', '!**/*.test.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src(['**/**.test.js', '*.test.js', '!node_modules/**/*'])
    .pipe(mocha({reporter: 'spec'}))
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 100 } }));
});

// gulp.task('test', function(){
//     return gulp.src(['**/**.test.js', '*.test.js', '!node_modules/**/*'], {read: false})
//             .pipe(mocha({reporter: 'spec'}));
// });

gulp.task('dev', function () {
    gulp.watch(['**/*_test.js', '**/*.js', '!node_modules/**/*'], ['test']);
});

gulp.task('release', ['test'], function(){
    var newVersion = incrementVersion(pkg.version, options.type);
    //this is the task to automat most of the release stuff... because it is lame and boring
    console.log('\n\nPreparing for a ' + chalk.bgGreen.bold(options.type) + ' release...\n\n');


    cp.exec('git log `git describe --tags --abbrev=0`..HEAD --pretty=format:"  - %s"', function (err, stdout, stderr) {
        var history = fs.readFileSync('./history.md');
        
        console.log('Updating the history.md file');

        fs.writeFile('./history.md', '### - ' + newVersion + ' *' + new Date().toLocaleString() + '*\n\n' + stdout + '\n\n\n' + history);
        
        cp.exec('git log --all --format="%aN <%aE>" | sort -u', function (err, stdout, stderr) {
            //write out the Authors file with all contributors
            console.log('Updating the AUTHORS file');

            fs.writeFile('./AUTHORS', stdout);

            cp.exec('git add .', function () {
                cp.exec('git commit -m "preparing for release of v' + newVersion + '"', function () {
                    console.log('commited the automated updates');
                    //run npm version
                    cp.exec('npm version ' + options.type, function(){
                        console.log('npm version to rev for release');
                        cp.exec('npm publish', function(){
                            console.log('pushing to origin');

                            cp.exec('git push origin master', function(){});
                            cp.exec('git push origin v' + newVersion, function(err){
                                if(err){
                                    console.log(err);
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