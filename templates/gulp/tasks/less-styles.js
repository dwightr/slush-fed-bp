'use strict';

var gulp         = require('gulp'),
    less         = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    rev          = require('gulp-rev'),
    gulpif       = require('gulp-if'),
    sourcemaps = require('gulp-sourcemaps'),
    handleErrors = require('../util/handleErrors');

gulp.task('styles', function () {
  return gulp.src('src/less/**/*.less')
    .pipe( less({
      compress: (global.mode === 'dev') ? 'flase' : 'true'
    }))
    .on('error', handleErrors)
    .pipe(autoprefixer({
        browsers: ['last 2 versions', '> 1%', 'ie 9', 'ie 10']
    }))
    .pipe( gulpif(global.mode == 'dev', sourcemaps.init()))
    .pipe( gulpif(global.mode !== 'dev', rev()))
    .pipe( gulpif(global.mode == 'dev', sourcemaps.write()))
    .pipe( gulp.dest(global.destination + '/css'))
    .pipe( rev.manifest({merge: true}))
    .pipe( gulpif(global.mode !== 'dev', gulp.dest('./dev/maps') ));
});