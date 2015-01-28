var gulp = require('gulp')
	, mocha = require('gulp-mocha');

gulp.task('default', function(){

});

gulp.task('test', function(){
	return gulp.src(['**/**_test.js', '!node_modules/**/*'], {read: false})
			.pipe(mocha({reporter: 'spec'}));
});