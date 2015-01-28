var gulp = require('gulp')
	, mocha = require('gulp-mocha')
	, minimist = require('minimist')
	, cp = require('child_process')
	, chalk = require('chalk')

	, knownOptions = {
		string: 'type',
  		default: { type: 'patch' }
	}

	, options = minimist(process.argv.slice(2), knownOptions);;

gulp.task('default', function(){

});

gulp.task('test', function(){
	return gulp.src(['**/**_test.js', '!node_modules/**/*'], {read: false})
			.pipe(mocha({reporter: 'spec'}));
});

gulp.task('release', ['test'], function(){
	//this is the task to automat most of the release stuff... because it is lame and boring
	console.log('\n\nPreparing for a ' + chalk.bgGreen.bold(options.type) + ' release...\n\n');

	//run npm version
	// cp.exec('npm version ' + options.type, function(){

	// });
});