var gulp = require('gulp');
var del = require('delete');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var typescript = require('gulp-typescript');
var sourcemap = require('gulp-sourcemaps');


var src = {
    ts: ['src/ts/**/*.ts'],
    js: ['src/js/**/*.js']
};

var name = 'ho-components';

var dist = 'dist';

var entry = 'components.js';


gulp.task('clean', function() {
    del.sync(dist);
});

gulp.task('package', ['clean'], function() {
    gulp.src('src/ts/components.ts')
    .pipe(sourcemap.init())
    .pipe(typescript({
        out: entry,
        sourceMap: true
    }))
    .pipe(sourcemap.write())
    .pipe(gulp.dest(dist));

    /*
    return gulp.src('src/js/' +  entry)
    .pipe(gulp.dest(dist));
    */
});


gulp.task('mini', ['package'], function() {
    return gulp.src(dist + '/' + entry)
    .pipe(uglify())
    .pipe(rename({
        extname: '.min.js'
    }))
    .pipe(gulp.dest(dist));
});

gulp.task('def', function() {
    return gulp.src('src/js/**/*.d.ts')
    .pipe(gulp.dest(dist + '/d.ts'));
});


gulp.task('default', ['mini'], null);
