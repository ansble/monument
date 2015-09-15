var gulp = require('gulp')
	, mocha = require('gulp-mocha')
	, minimist = require('minimist')
	, cp = require('child_process')
	, chalk = require('chalk')
	, fs = require('fs')
    , istanbul = require('gulp-istanbul')
    , coveralls = require('gulp-coveralls')

	, pkg = require('./package.json')

	, knownOptions = {
		string: 'type',
  		default: { type: 'patch' }
	}

	, incrementVersion = function (version, type) {
		'use strict';

		var versionArr = version.split('.');

		if(type === 'major'){
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

gulp.task('default', function(){

});

gulp.task('test', function(){
	'use strict';
  return gulp.src(['./utils/**/*.js', '!./utils/**/*_test.js', './routes/**/*.js', '!./routes/**/*_test.js', '*.js', '!*_test.js', '!gulpfile.js'])
      // Right there
      .pipe(istanbul({includeUntested: true}))
      .pipe(istanbul.hookRequire())
      .on('finish', function () {
         gulp.src(['**/**_test.js', '!node_modules/**/*'], {read: false})
            .pipe(mocha({reporter: 'spec'}))
            .pipe(istanbul.writeReports());
      });
});

gulp.task('coveralls', function () {
  'use strict';

  return gulp.src('coverage/**/lcov.info')
            .pipe(coveralls());
});

gulp.task('release', ['test'], function(){
	'use strict';

	var newVersion = incrementVersion(pkg.version, options.type);
	//this is the task to automat most of the release stuff... because it is lame and boring
	console.log('\n\nPreparing for a ' + chalk.bgGreen.bold(options.type) + ' release...\n\n');


	cp.exec('git log `git describe --tags --abbrev=0`..HEAD --pretty=format:"  - %s"', function (err, stdout) {
		var history = fs.readFileSync('./history.md');

		console.log('Updating the history.md file');

		fs.writeFile('./history.md', '### - ' + newVersion + ' *' + new Date().toLocaleString() + '*\n\n' + stdout + '\n\n\n' + history);

		cp.exec('git log --all --format="%aN <%aE>" | sort -u', function (err, stdout) {
			//write out the Authors file with all contributors
			console.log('Updating the AUTHORS file');

			fs.writeFileSync('./AUTHORS', stdout);

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

// so we can test the gulpfile
if (typeof exports !== 'undefined') {
   exports.incrementVersion = incrementVersion;
}
