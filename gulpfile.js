'use strict';

var path = require('path');
var gulp = require('gulp');
var bump = require('gulp-bump');
var git = require('gulp-git');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var header = require('gulp-header');
var stylus = require('gulp-stylus');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var streamify = require('gulp-streamify');
var source = require('vinyl-source-stream');
var size = require('gulp-size');
var extended = [
  '/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''
].join('\n');

var succint = ' <%= pkg.name %>@v<%= pkg.version %>, <%= pkg.license %> licensed. <%= pkg.homepage %>';
var succjs = '//' + succint + '\n';
var succss = '/*' + succint + ' */\n';

gulp.task('clean', function () {
  gulp.src('./dist', { read: false })
    .pipe(clean());
});

gulp.task('build', ['styles'], function () {
  var pkg = require('./package.json');

  return browserify('./src/hint.js', { debug: true, standalone: 'hint' })
    .bundle()
    .pipe(source('hint.js'))
    .pipe(streamify(header(extended, { pkg : pkg } )))
    .pipe(gulp.dest('./dist'))
    .pipe(streamify(rename('hint.min.js')))
    .pipe(streamify(uglify()))
    .pipe(streamify(header(succjs, { pkg : pkg } )))
    .pipe(streamify(size()))
    .pipe(gulp.dest('./dist'));
});

gulp.task('styles', ['clean', 'bump'], function () {
  var pkg = require('./package.json');

  return gulp.src('./src/hint.styl')
    .pipe(stylus({
      import: path.resolve('node_modules/nib/index')
    }))
    .pipe(header(extended, { pkg : pkg } ))
    .pipe(gulp.dest('./dist'))
    .pipe(rename('hint.min.css'))
    .pipe(minifyCSS())
    .pipe(size())
    .pipe(header(succss, { pkg : pkg } ))
    .pipe(gulp.dest('./dist'));
});

gulp.task('bump', function () {
  var bumpType = process.env.BUMP || 'patch'; // major.minor.patch

  return gulp.src(['./package.json'])
    .pipe(bump({ type: bumpType }))
    .pipe(gulp.dest('./'));
});

gulp.task('tag', ['build'], function (done) {
  var pkg = require('./package.json');
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;

  gulp.src('./')
    .pipe(git.commit(message))
    .pipe(gulp.dest('./'))
    .on('end', tag);

  function tag () {
    git.tag(v, message);
    git.push('origin', 'master', { args: '--tags' }).end();
    done();
  }
});

gulp.task('npm', ['tag'], function (done) {
  var child = require('child_process').exec('npm publish', {}, function () {
    done();
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('error', function () {
    throw new Error('unable to publish');
  });
});

gulp.task('release', ['npm']);
