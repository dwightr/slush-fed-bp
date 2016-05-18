'use strict';

var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    sassLint     = require('gulp-sass-lint'),
    handleErrors = require('../util/handleErrors');

gulp.task('scsslint', function () {

  return gulp.src('src/scss/**/*.scss')
    .pipe(sassLint({
      configFile: '../scss-lint.yml'
    }))
    .pipe(sassLint.format())
    .on('error', handleErrors);

});