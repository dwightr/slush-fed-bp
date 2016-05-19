'use strict';

var gulp = require('gulp'),
	browserSync = require('browser-sync');

gulp.task('watch', function() {

  gulp.watch('src/*.html',  ['html']);
  @@gulp.watch('src/scss/**/*.scss',  ['styles','scsslint']); @@//This line is replaced in the slushfile
  @@gulp.watch('src/less/**/*.less',  ['styles']); @@//This line is replaced in the slushfile
  gulp.watch('src/img/**/*',  ['images']);
  gulp.watch('src/js/**/*.js',  ['scripts','jshints']);
});