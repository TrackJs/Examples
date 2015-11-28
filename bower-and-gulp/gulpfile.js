
var gulp = require("gulp");
var bower = require("bower")
var uglify = require("gulp-uglify");
var connect = require("gulp-connect");
var concat = require("gulp-concat");
var bowerSources = [];


// Take all bower sources and bundle them in with our other scripts.  Adds all main paths to "bowerSources" array.
gulp.task("bower", function (done){
	bower.commands.list({paths: true})
	.on('end', function (componentPaths) {
		bowerSources = [];
	    for(var packageName in componentPaths){
	    	bowerSources.push(componentPaths[packageName])
	    	done();
	    }
	});
})

gulp.task("bundle", ["bower"], function () {
	console.log(bowerSources);
    gulp.src(["./scripts/trackerConfig.js", "./scripts/*.js"].concat(bowerSources)) 
    .pipe(uglify())
    .pipe(concat("bundle.js"))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("run",  ["bundle"], function (){
	connect.server({
		port: 8080
	})
});