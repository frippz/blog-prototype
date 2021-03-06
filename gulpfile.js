/**
 * gulpfile.js
 *
 * All the yummy build stuff!
 */

// Requirements
var gulp             = require('gulp'),
    gutil            = require('gulp-util'),
    plumber          = require('gulp-plumber'),
    sourcemaps       = require('gulp-sourcemaps'),
    autoprefixer     = require('gulp-autoprefixer'),
    minifyCss        = require('gulp-minify-css'),
    concat           = require('gulp-concat'),
    uglify           = require('gulp-uglify'),
    postcss          = require('gulp-postcss'),
    watch            = require('gulp-watch'),
    customProperties = require('postcss-custom-properties'),
    ghPages          = require('gh-pages'),
    path             = require('path'),
    eslint           = require('gulp-eslint'),
    htmlhint         = require('gulp-htmlhint'),
    w3cjs            = require('gulp-w3cjs'),
    dirSync          = require('gulp-directory-sync'),
    webserver        = require('gulp-webserver');

// Configure paths
var paths = {

  // Inputs
  js: ['./src/gui/js/**/*.js'],
  css: ['./src/gui/css/**/*.css'],

  // Static assets
  images: './src/gui/i/',
  templates: ['./src/**/*.html'],

  // Outputs
  jsOutput: 'main.js',
  cssOutput: 'styles.css',

  // Destinations
  jsDest: './dist/gui/js/',
  cssDest: './dist/gui/css/',
  imgDest: './dist/gui/i/',
  tplDest: './dist/'

};

// Error handler
var onError = function (err) {
  gutil.beep();
  console.log(err);
};

// Process stylesheets
gulp.task('css', function () {
  return gulp.src(paths.css)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(postcss([customProperties()]))
    .pipe(concat(paths.cssOutput))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.cssDest));
});

// Concatenate and minify JavaScript
gulp.task('js', function () {
  return gulp.src(paths.js)
    .pipe(sourcemaps.init())
    .pipe(concat(paths.jsOutput))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.jsDest));
});

// HTMLhint
gulp.task('htmlhint', function () {
 return gulp.src(paths.templates)
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter('htmlhint-stylish'))
    .pipe(htmlhint.failReporter({ suppress: true }));
});

// eslint
gulp.task('eslint', function () {
  return gulp.src(paths.js)
    .pipe(eslint())
    .pipe(eslint.format());
});

// Validation
gulp.task('validate', function () {
  return gulp.src(paths.templates)
    .pipe(w3cjs());
});

// Linting task
gulp.task('lint', ['htmlhint', 'eslint', 'validate']);

// Watch for changes
gulp.task('watch', function() {
  watch(paths.css, function() {
    gulp.start(['css']);
  });
  watch(paths.js, function() {
    gulp.start(['js', 'eslint']);
  });
  watch(paths.images, function() {
    gulp.start(['images']);
  });
  watch(paths.templates, function() {
    gulp.start(['templates', 'htmlhint', 'validate']);
  });
});

// Copy image assets into /dist
gulp.task('images', function(){
  gulp.src(paths.images)
    .pipe(dirSync(paths.images, paths.imgDest));
});

// Copy template assets into /dist
gulp.task('templates', function () {
  gulp.src(paths.templates)
    .pipe(gulp.dest(paths.tplDest));
});

// Deploy to gh-pages
gulp.task('deploy', function (cb) {
  ghPages.publish(path.join(process.cwd(), paths.tplDest), cb);
});

// Web server
gulp.task('webserver', function() {
  gulp.src(paths.tplDest)
    .pipe(webserver({
      host: '0.0.0.0',
      port: 4004,
      livereload: true
    }));
});

gulp.task('default', ['watch', 'css', 'js', 'images', 'templates', 'lint', 'webserver']);
