var gulp = require('gulp');
var del = require('delete');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var typescript = require('gulp-typescript');
var sourcemap = require('gulp-sourcemaps');
var concat = require('gulp-concat');


var src = {
    ts: ['src/**/*.ts'],
    js: ['src/**/*.js']
};

var name = 'ho-components';

var dist = 'dist';

var entry = 'components.js';


gulp.task('clean', function() {
    return del.sync(dist+'/d.ts', {force: true}) && del.sync(dist, {force: true});
});

/*
gulp.task('package', ['clean'], function() {
    return gulp.src('src/ts/components.ts')
    .pipe(sourcemap.init())
    .pipe(typescript({
        out: entry,
        target: 'es5',
        sourceMap: true
    }))
    .pipe(sourcemap.write())
    .pipe(gulp.dest(dist));
});
*/

var tsProject = typescript.createProject('gulp-tsconfig.json');
gulp.task('package', ['clean'], function() {
    var tsResult = tsProject.src()
        .pipe(sourcemap.init())
        .pipe(typescript(tsProject));

  return tsResult.js
        .pipe(concat(entry))
        .pipe(sourcemap.write())
        .pipe(gulp.dest(dist));
});


gulp.task('mini', ['package'], function() {
    return gulp.src(dist + '/' + entry)
    .pipe(uglify())
    .pipe(rename({
        extname: '.min.js'
    }))
    .pipe(gulp.dest(dist));
});

gulp.task('def', ['mini'], function() {
    var ts =  gulp.src(src.ts)
    .pipe(typescript({
        out: entry,
        declaration: true
    }));

    return ts.dts.pipe(gulp.dest(dist));
});


gulp.task('default', ['def'], null);
