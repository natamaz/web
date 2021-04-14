'use strict';

const gulp = require('gulp');
const include = require('gulp-include');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const wait = require('gulp-wait');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();

const notify = require('gulp-notify');
const plumber = require('gulp-plumber');

const del = require('del');

const gulpif = require('gulp-if');

gulp.task('apply-prod-environment', function(cb) {
    process.env.NODE_ENV = 'production';
    cb();
});

gulp.task('apply-dev-environment', function(cb) {
    process.env.NODE_ENV = 'development';
    cb();
});

gulp.task('sass', function() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(wait(500))
        .pipe(plumber({
            errorHandler: notify.onError(err => ({
              title: 'Styles',
              message: err.message
            }))
          }))
        .pipe(gulpif(process.env.NODE_ENV === 'development', sourcemaps.init()))
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(autoprefixer())
        .pipe(gulpif(process.env.NODE_ENV === 'development', sourcemaps.write()))
        .pipe(gulp.dest('dist/css'));

});

gulp.task('html', function() {
    return gulp.src('src/*.html', {since: gulp.lastRun('html')})
        .pipe(gulpif(process.env.NODE_ENV === 'production', imagemin([
            imagemin.jpegtran({progressive: true})
        ])))
        .pipe(gulp.dest('dist'));

});

gulp.task('js', function() {
    return gulp.src('src/js/**/*')
            .pipe(include())
            //.pipe(uglify())
              .on('error', console.log)
              .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))
        .pipe(gulp.dest('dist/js'));

});

gulp.task('img', function() {
    return gulp.src('src/img/**/*', {since: gulp.lastRun('img')})
        .pipe(gulp.dest('dist/img'));

});

gulp.task('fonts', function() {
    return gulp.src('src/fonts/**/*', {since: gulp.lastRun('fonts')})
        .pipe(gulp.dest('dist/fonts'));

});

gulp.task('clean', function() {
    return del('dist/**/*', {force: true});
});

gulp.task('watch', function() {
    gulp.watch('src/scss/**/*.scss', gulp.parallel('sass'));
    gulp.watch('src/*.html', gulp.parallel('html'));
    gulp.watch('src/js/**/*.js', gulp.parallel('js'));
    gulp.watch('src/img/**/*.*', gulp.parallel('img'));
    gulp.watch('src/fonts/**/*.*', gulp.parallel('fonts'));
});

gulp.task('server', function() {
    browserSync.init({
        server: 'dist'
    });
    browserSync.watch('dist/**/*.*').on('change',browserSync.reload);
});
gulp.task('build',
    gulp.series('clean', gulp.parallel('sass','html','js','img','fonts'))
);
gulp.task('default',
    gulp.series('apply-dev-environment', 'build', gulp.parallel('watch','server'))
);
gulp.task('buildProd',
    gulp.series('apply-prod-environment', 'build', gulp.parallel('watch','server'))
);
