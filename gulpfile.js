var gulp = require('gulp');
var inject = require('gulp-js-text-inject');

gulp.task('js', function() {
    return gulp.src('resources/Resources.js')
        .pipe(inject({
            basepath: 'resources'
        }))
        .pipe(gulp.dest('server/imports/'));
});
