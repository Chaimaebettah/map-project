var gulp = require('gulp');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

gulp.task('css', function() {
  return gulp.src('./src/**/*.css')
    .pipe(minify())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('js', function() {
  return gulp.src('./src/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('html', function() {
  return gulp.src('./src/index.html')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function() {
  gulp.watch('./src/styles/style.css', ['css']);
  gulp.watch('./src/scripts/main.js', ['js']);
  gulp.watch('./src/index.html', ['html']);
});

gulp.task('default', ['css', 'js', 'html', 'watch']);
