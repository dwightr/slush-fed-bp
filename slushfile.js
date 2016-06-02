/*
 * slush-slush-fed-bp
 * https://github.com/maneeshchiba/slush-slush-fed-bp
 */

'use strict';

var gulp = require('gulp'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    path = require('path'),
    gulpif = require('gulp-if'),
    replace = require('gulp-replace-task'),
    lazypipe = require('lazypipe'),
    del  = require('del');

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}

var defaults = (function () {
    var workingDirName = path.basename(process.cwd()),
      homeDir, osUserName, configFile, user;

    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
        osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
    }
    else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
        osUserName = homeDir && homeDir.split('/').pop() || 'root';
    }

    configFile = path.join(homeDir, '.gitconfig');
    user = {};

    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }

    return {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || '',
        styleLanguage: '',
        templateLanguage: '',
        frameworks: ''
    };
})();

gulp.task('default', function (done) {
    var prompts = [{
        name: 'appName',
        message: 'What is the name of your project?',
        default: defaults.appName
    }, {
        name: 'appDescription',
        message: 'What is the description?'
    }, {
        name: 'appVersion',
        message: 'What is the version of your project?',
        default: '0.1.0'
    }, {
        name: 'authorName',
        message: 'What is the your name?',
        default: defaults.authorName
    }, {
        name: 'authorEmail',
        message: 'What is the your email?',
        default: defaults.authorEmail
    }, {
        name: 'userName',
        message: 'What is your github username?',
        default: defaults.userName
    }, {
        name: 'styleLanguage',
        type: 'list',
        message: 'Which preprocessor language do you want to use?',
        choices: ['sass','less']
    }, {
        name: 'templateLanguage',
        type: 'list',
        message: 'Which templating language do you want to use?',
        choices: ['none','nunjucks']
    }, {
        name: 'frameworks',
        type: 'checkbox',
        message: 'Select frameworks and libraries: (Use spacebar to select)',
        choices: ['bootstrap','jQuery']
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Are you happy with your build config?'
    }];
    //Ask
    inquirer.prompt(prompts,
        function (answers) {
            if (!answers.moveon) {
                return done();
            }
            answers.appNameSlug = _.slugify(answers.appName);
            var bootstrap, jQuery;
            for(var i = 0; i < answers.frameworks.length; i++){
                if (answers.frameworks[i] == 'bootstrap'){
                    bootstrap = true;
                }
                if (answers.frameworks[i] == 'jQuery'){
                    jQuery = true;
                }
            }
            var files = [__dirname + '/templates/**'];

            gulp.src(files)
                .pipe(template(answers))
                .pipe(rename(function (file) {
                    if (file.basename[0] === '_') {
                        file.basename = '.' + file.basename.slice(1);
                    }
                }))
                .pipe(conflict('./'))
                .pipe(
                    gulpif( answers.styleLanguage == 'sass',
                        replace({
                            patterns: [{
                                json: {
                                    '"gulp-less": "^3.1.0",': '',
                                    '"gulp-sass": "^2.3.1",':'"gulp-sass": "^2.3.1",',
                                    '"gulp-sass-lint": "^1.1.1",':'"gulp-sass-lint": "^1.1.1",',
                                    'gulp.watch(\'src/scss/**/*.scss\',  [\'styles\',\'scsslint\']);':'gulp.watch(\'src/scss/**/*.scss\',  [\'styles\',\'scsslint\']);',
                                    'gulp.watch(\'src/less/**/*.less\',  [\'styles\']);':'',
                                    '\'scsslint\',':'\'scsslint\',',
                                    '//This line is replaced in the slushfile':'',
                                    '"normalize-scss": "^5.0.3",':'"normalize-scss": "^5.0.3",',
                                    '"normalize-css": "^2.3.1",':''
                                }
                            }]
                        })
                    )
                )
                .pipe(
                    gulpif( answers.styleLanguage == 'less',
                        replace({
                            patterns: [{
                                json: {
                                    '"gulp-less": "^3.1.0",': '"gulp-less": "^3.1.0",',
                                    '"gulp-sass": "^2.3.1",':'',
                                    '"gulp-sass-lint": "^1.1.1",':'',
                                    'gulp.watch(\'src/scss/**/*.scss\',  [\'styles\',\'scsslint\']);':'',
                                    'gulp.watch(\'src/less/**/*.less\',  [\'styles\']);':'gulp.watch(\'src/less/**/*.less\',  [\'styles\']);',
                                    '\'scsslint\',':'',
                                    '//This line is replaced in the slushfile':'',
                                    '"normalize-css": "^2.3.1",':'"normalize-css": "^2.3.1",',
                                    '"normalize-scss": "^5.0.3",':''
                                }
                            }]
                        })
                    )
                )
                .pipe(
                    gulpif( answers.templateLanguage == 'none',
                        replace({
                            patterns: [{
                                json: {
                                    '"gulp-nunjucks": "^2.2.0",': '',
                                    '//This line is replaced in the slushfile':'',
                                    'nunjucksVar':'',
                                    'templatePipe':''
                                }
                            }]
                        })
                    )
                )
                .pipe(
                    gulpif( answers.templateLanguage == 'nunjucks',
                        replace({
                            patterns: [{
                                json: {
                                    '"gulp-nunjucks": "^2.2.0",': '"gulp-nunjucks": "^2.2.0",',
                                    '//This line is replaced in the slushfile':'',
                                    'nunjucksVar':'nunjucks = require(\'gulp-nunjucks-html\'),',
                                    'templatePipe':'.pipe(nunjucks({ searchPaths: [\'src/\'] }))'
                                }
                            }]
                        })
                    )
                )
                .pipe(
                    gulpif( (bootstrap == true) && (answers.styleLanguage == 'sass') ,
                        replace({
                            patterns: [{
                                json: {
                                    '"bootstrap-sass": "^3.3.6",': '"bootstrap-sass": "^3.3.6",',
                                    '"bootstrap-less": "^3.3.8",':'',
                                    '"jquery": "^2.2.4",': '"jquery": "^2.2.4",',
                                    '//This line is replaced in the slushfile':'',
                                    'includePaths:[\'node_modules/bootstrap-sass/assets/stylesheets\'],':'includePaths:[\'node_modules/bootstrap-sass/assets/stylesheets\'],',
                                    ',\'node_modules/bootstrap-sass/assets/javascripts/bootstrap.js\'':',\'node_modules/bootstrap-sass/assets/javascripts/bootstrap.js\'',
                                    ',\'node_modules/jquery/dist/jquery.js\'': ',\'node_modules/jquery/dist/jquery.js\'',
                                    ',\'node_modules/bootstrap-less/js/bootstrap.js\'':'',
                                    'includePaths:[\'node_modules/normalize-scss/sass/normalize/\'],':''
                                }
                            }]
                        }),
                        replace({
                            patterns: [{
                                json: {
                                    '"bootstrap-sass": "^3.3.6",': '',
                                    '//This line is replaced in the slushfile':'',
                                    'includePaths:[\'node_modules/bootstrap-sass/assets/stylesheets\'],':'',
                                    ',\'node_modules/bootstrap-sass/assets/javascripts/bootstrap.js\'':'',
                                    'includePaths:[\'node_modules/normalize-scss/sass/normalize/\'],':'includePaths:[\'node_modules/normalize-scss/sass/normalize/\'],'
                                }
                            }]
                        })
                    )
                )
                .pipe(
                    gulpif( (bootstrap == true) && (answers.styleLanguage == 'less') ,
                        replace({
                            patterns: [{
                                json: {
                                    '"bootstrap-less": "^3.3.8",':'"bootstrap-less": "^3.3.8",',
                                    '"jquery": "^2.2.4",': '"jquery": "^2.2.4",',
                                    '//This line is replaced in the slushfile':'',
                                    '\'node_modules/bootstrap-less/bootstrap/**/*.less\',':'\'node_modules/bootstrap-less/bootstrap/**/*.less\',',
                                    ',\'node_modules/bootstrap-less/js/bootstrap.js\'':',\'node_modules/bootstrap-less/js/bootstrap.js\'',
                                    ',\'node_modules/jquery/dist/jquery.js\'': ',\'node_modules/jquery/dist/jquery.js\'',
                                    '\'node_modules/normalize-css/normalize.css\',':''
                                }
                            }]
                        }),
                        replace({
                            patterns: [{
                                json: {
                                    '"bootstrap-less": "^3.3.8",':'',
                                    '//This line is replaced in the slushfile':'',
                                    '\'node_modules/bootstrap-less/bootstrap/**/*.less\',':'',
                                    ',\'node_modules/bootstrap-less/js/bootstrap.js\'':'',
                                    '\'node_modules/normalize-css/normalize.css\',':'\'node_modules/normalize-css/normalize.css\','
                                }
                            }]
                        })
                    )
                )
                .pipe(
                    gulpif( jQuery == true,
                        replace({
                            patterns: [{
                                json: {
                                    '"jquery": "^2.2.4",': '"jquery": "^2.2.4",',
                                    '//This line is replaced in the slushfile':'',
                                    ',\'node_modules/jquery/dist/jquery.js\'': ',\'node_modules/jquery/dist/jquery.js\''
                                }
                            }]
                        }),
                        replace({
                            patterns: [{
                                json: {
                                    '"jquery": "^2.2.4",': '',
                                    '//This line is replaced in the slushfile':'',
                                    ',\'node_modules/jquery/dist/jquery.js\'': ''
                                }
                            }]
                        })
                    )
                )
                .pipe(gulp.dest('./'))
                .on('end', function() {
                    if (answers.styleLanguage == 'sass'){
                        gulp.src('./gulp/tasks/scss-styles.js')
                          .pipe(rename('styles.js'))
                          .pipe(gulp.dest('./gulp/tasks/'));
                        del(['./gulp/tasks/scss-styles.js','./gulp/tasks/less-styles.js','./src/less']);
                    }
                    if (answers.styleLanguage == 'less'){
                        gulp.src('./gulp/tasks/less-styles.js')
                          .pipe(rename('styles.js'))
                          .pipe(gulp.dest('./gulp/tasks/'));
                        del(['./gulp/tasks/scss-styles.js','./gulp/tasks/scsslint.js','./gulp/scss-lint.yml','./gulp/tasks/less-styles.js','./src/scss']);
                    }
                    if ((bootstrap !== true) && (answers.styleLanguage == 'sass')){
                        del(['./src/scss/variables.scss','./src/scss/vendor/bootstrap.scss']);
                    }
                    if ((bootstrap == true) && (answers.styleLanguage == 'sass')){
                        gulp.src('./src/scss/variables.scss')
                          .pipe(rename('_variables.scss'))
                          .pipe(gulp.dest('./src/scss/'));
                        gulp.src('./src/scss/vendor/bootstrap.scss')
                          .pipe(rename('_bootstrap.scss'))
                          .pipe(gulp.dest('./src/scss/vendor/'));
                        del(['./src/scss/variables.scss','./src/scss/vendor/bootstrap.scss','./src/scss/vendor/normalize.scss']);
                    }
                    done();
                })
                .pipe(install());

        });
});