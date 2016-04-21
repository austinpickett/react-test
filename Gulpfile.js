var gulp = require('gulp')
	source = require('vinyl-source-stream'),
	server = require('gulp-server-livereload'),
	uglify = require('gulp-uglify'),
	useref = require('gulp-useref'),
	cssmin = require('gulp-cssmin'),
	sass = require('gulp-sass'),
	gutil = require('gulp-util'),
	notify = require('gulp-notify'),
	browserify = require('browserify'),
	watchify = require('watchify'),
	babelify = require('babelify');

// adapted from https://blog.avisi.nl/2014/04/25/how-to-keep-a-fast-build-with-browserify-and-reactjs/
buildScript = function(watch) {
	var props = {
		entries: ['src/js/main.js'],
		debug: false,
		transform: [babelify.configure({
			presets: ['es2015', 'react']
		})]
	};

	var bundler = browserify(props);
	if(watch) {
		watchify(bundler);
	}

	rebundle = function() {
		var stream = bundler.bundle();
		return stream.on('error', notify.onError({
			title: "Eror",
			message: "<%= error.message %>"
		}))
		.pipe(source('main.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(notify({title: 'JS Rebuilt'}));
	};

	bundler.on('update', function() {
		rebundle();
		gutil.log('Rebundle...');
	});

	rebundle();
};

gulp.task('server', function() {
	gulp.src('dist')
	    .pipe(server({
			livereload: true,
			directoryListing: false,
			open: true,
			fallback: 'index.html'
	    }));
});

gulp.task('html', function() {
	gulp.src('src/index.html')
		.pipe(useref())
		.pipe(gulp.dest('dist'));
});

gulp.task('json', function() {
	gulp.src('src/api/comments.json')
		.pipe(useref())
		.pipe(gulp.dest('dist/api'));
});

gulp.task('sass', function() {
	gulp.src('src/css/main.sass')
		.pipe(sass().on('error', sass.logError))
		.pipe(cssmin())
		.pipe(gulp.dest('dist/css'))
});

// gulp.task('js', function() {
// 	buildScript(false);
// 	gulp.src('src/js/plugins.js')
// 		.pipe(useref())
// 		.pipe(gulp.dest('dist/js'));
// });

gulp.task('images', function() {});

gulp.task('default', ['html', 'server'],function() {
	buildScript(true);
	gulp.watch(['src/index.html'], ['html']);
	// gulp.watch(['src/js/plugins.js'], ['js']);
	gulp.watch(['src/css/main.sass'], ['sass']);
	gulp.watch(['src/api/comments.json'], ['json']);
});