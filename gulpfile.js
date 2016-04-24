var gulp    = require("gulp");
var jshint    = require("gulp-jshint");
var rimraf    = require("rimraf");
var browserify  = require("browserify");
var reactify  = require('reactify');
var babelify  = require('babelify');
var vsource   = require("vinyl-source-stream");
var vbuffer   = require("vinyl-buffer");
var $     = require("gulp-load-plugins")({});

// Clean
gulp.task("clean", function() {
  rimraf.sync("public/css");
  rimraf.sync("public/fonts");
  rimraf.sync("public/img");
  rimraf.sync("public/admin");
  return rimraf.sync("public/js");
});

// Copy static assets
gulp.task("copyStatic", function() {
  return gulp.src('src/assets/img/**/*').pipe(gulp.dest('public/img'));
});

// Concatenate JS
gulp.task("jsconcat", function() {
  return gulp.src([
      "bower_components/jquery/dist/jquery.min.js",
      "src/assets/js/vendor/*.js"
    ]).pipe( $.concat("vendor.min.js"))
    .pipe( gulp.dest("public/js"));
});

// Compile JS
gulp.task( "javascript", function() {
  var b = browserify({
    entries: "src/assets/js/main.js",
    transform: [babelify, reactify],
    debug: true
  });

  var out =  b.bundle()
    .pipe(vsource("scripts.min.js"))
    .pipe(vbuffer());

  //out.pipe($.uglify());

  return out
    .pipe( gulp.dest( "public/js" ) );
});

/** JSHint */
gulp.task( "jshint", function () {
  return gulp.src(["src/assets/js/**/*.js",])
    .pipe( jshint() )
    .pipe( jshint.reporter( "jshint-stylish" ) )
    .pipe( jshint.reporter('fail') )
    .on('error', function(e) {
      $.notify().write(e);
    });
});

// Stylesheets
gulp.task("stylesheets", function() {
  var paths = [
    'bower_components/normalize-scss/',
    'bower_components/bourbon/app/assets/stylesheets',
    'bower_components/neat/app/assets/stylesheets',
  ];

  var out = gulp.src('js/assets/sass/main.scss')
    //.pipe( $.sourcemaps.init() )
    .pipe( $.cssGlobbing({
      extensions: ['.css','.scss']
    }))
    .pipe( $.sass({
      style: 'expanded',
      includePaths: paths
    }))
    .on('error', $.sass.logError)
    .pipe( $.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    })
    //.pipe($.sourcemaps.write())
  );

  //out.pipe( $.csso() );

  return out
    .pipe( gulp.dest('public/css') )
});

// Stylesheets
gulp.task("adminStylesheets", function() {
  var out = gulp.src('resources/assets/admin/sass/main.scss')
    .pipe( $.sourcemaps.init() )
    .pipe( $.cssGlobbing({
      extensions: ['.scss']
    }))
    .pipe( $.sass({
      style: 'expanded'
    }))
    .on('error', $.sass.logError)
    .pipe( $.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    })
  );

  //out.pipe( $.csso() );

  return out.pipe( gulp.dest('public/admin/css') )
});

// Livereload
gulp.task( "watch", ["clean", "adminStylesheets", "stylesheets", "javascript", "jsconcat", "copyStatic"], function() {
  $.livereload.listen();

  gulp.watch(["resources/assets/img/**/*.*", "resources/assets/fonts/*.*"], ["copyStatic"]);
  gulp.watch("resources/assets/js/vendor/*.js", ["jsconcat"]);
  gulp.watch("resources/assets/admin/sass/**/*.scss", ["adminStylesheets"]);
  gulp.watch("resources/assets/sass/**/*.scss", ["stylesheets"]);
  gulp.watch("resources/assets/js/**/*.js", ["javascript"]);

  gulp.watch([
    "public/js/*.js",
    "public/css/*.css",
    "public/img/**/*.*",
    "public/fonts/*.*"
  ]).on( "change", function( file ) {
    $.livereload.changed(file.path);
  });
});

gulp.task("default", [
  "adminStylesheets",
  "stylesheets",
  "javascript",
  "jsconcat",
  "copyStatic"
]);

gulp.task("build",["default"]);