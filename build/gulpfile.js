var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');


gulp.task('clean', function (cb) {
  del(['./dist/cfw.js', './dist/cfw.min.js'], cb);
});

gulp.task('bundle', ['clean'], function() {
	return gulp.src(['../promise.js', '../renderer.js', '../options.js', '../main.js', '../component.js'])
		.pipe(concat('cfw.js'))
		.pipe(wrap('(function(){\n<%= contents %>})();'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('bundle-min', ['bundle'], function() {
	return gulp.src('./dist/cfw.js')
		.pipe(uglify())
		.pipe(rename('cfw.min.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['bundle', 'bundle-min'], function() {
	return void 0;
});
