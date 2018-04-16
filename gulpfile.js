var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    bower = require('gulp-bower'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    gutil = require('gulp-util'),
    gnotify = require('gulp-notify'),

    exec = require('child_process').exec,
    run = require('gulp-run'),

    sass = require('gulp-sass'),
    codekit = require('codekit-scanner'),
    cleanCSS = require('gulp-clean-css'),
    eslint = require('gulp-eslint'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish');

// Nova API SASS/SCSS >> CSS

gulp.task('sass', ['bower'], function () {
    return gulp.src(['scss/nova.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(gnotify('SASS Compiled'));
});

// Nova API UI Templates
gulp.task('hbs-secure-exec', function (nextTask) {
    return exec('./handlebarspp.sh ./templates/compiled/secure', function (err, stdout, stderr) {
        console.log(stderr);
        nextTask();
    });
});

gulp.task('hbs-exec', ['hbs-secure-exec'], function (nextTask) {
// running shell command, gulp-handlebars uses handlbars compiler version 2.x and not 4.0
    return exec('./node_modules/.bin/handlebars ./templates/compiled/secure -f ./templates/compiled/nova.secure-templates.js -e hbs -k each -k if -k unless', function (err, stdout, stderr) {
        console.log(stderr, stdout);
        nextTask();
    });
});

gulp.task('nova', ['eslint', 'hbs-exec', 'buildVersion'], function () {
    codekit({file: 'js/nova.js', fw: uiFrameworkPath, jsDir: 'js'}, function (files) {
        files.push(buildVerLoc);
        console.log('Nova', files);
        gulp.src(files)
            .pipe(sourcemaps.init())
            .pipe(uglify().on('error', gutil.log))
            .pipe(concat('nova-min.js'))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('dist/js'))
            .pipe(gnotify('Build Completed!'));
    });
});

gulp.task('assets', function () {
    gulp.src('images/**')
        .pipe(gulp.dest('dist/images'));
    gulp.src(['./*.html'])
        .pipe(gulp.dest('dist'));
});


gulp.task('bower', function (nextTask) {
    return bower({cwd: uiFrameworkPath}, nextTask);
});

// Run bower install task before framework to generate bower_components
gulp.task('framework', ['bower'], function () {
    codekit({file: 'js/nova.framework.js', fw: uiFrameworkPath, jsDir: 'js'}, function (files) {
        console.log('Framework', files);
        gulp.src(files)
            .pipe(sourcemaps.init())
            .pipe(uglify().on('error', gutil.log))
            .pipe(concat('nova.framework-min.js'))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('dist/js'));
    });
});

gulp.task('jshint', function () {
    return gulp.src(['js/*.js', 'js/modules/*.js', 'js/views/*.js'])
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('eslint', ['jshint', 'hbs-exec'], function () {
    console.log('task eslint');
    codekit({file: 'js/nova.js', fw: uiFrameworkPath, jsDir: 'js'}, function (files) {
        gulp.src(files)
            .pipe(eslint.format())
            .pipe(eslint.failAfterError());
    });
});

gulp.task('default', ['framework', 'nova', 'sass', 'assets']);
gulp.task('css', ['sass']);
gulp.task('js', ['nova']);