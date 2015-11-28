
var gulp = require("gulp");
var uglify = require("gulp-uglify");
var connect = require("gulp-connect");
var concat = require("gulp-concat");


gulp.task("bundle", function () {
    gulp.src(["./scripts/trackerConfig.js", "./scripts/*.js"]) 
    .pipe(uglify())
    .pipe(concat("bundle.js"))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("run",  ["bundle"], function (){
	connect.server({
		port: 8080
	})
});