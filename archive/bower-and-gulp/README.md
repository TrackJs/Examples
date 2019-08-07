### Bundling TrackJS with Gulp
This is an example showing how to add TrackJS to a script bundle.  The bundle will be built using gulp.

#### Running the example

Be sure to set your token on the configuration object in `scripts/trackerConfig.js`

```bash 
# If it's not already installed
npm install --global gulp 
npm install --global bower

bower install
npm install
gulp run
# Navigate to localhost:8080
```

#### How does it work?

Within the `gulpfile` there are two steps.  

The first is to retrieve a list of all bower source paths.  We will eventually create a bundle with these files.

```javascript
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
```

Next we include our tracker configuration (`/scripts/trackerConfig.js`) as the very first script in the bundle, followed by our bower packages and other vendor libs, and lastly our app code.

This ensures the tracker configuration is defined before the tracker script itself is loaded from the bower_components folder.  We load app code last as it's likely dependent on bower packages.


```javascript
gulp.task("bundle", ["bower"], function () {
	console.log(bowerSources);
    gulp.src(["./scripts/trackerConfig.js"]
			.concat(bowerSources)
			.concat("./scripts/*.js"))
    .pipe(uglify())
    .pipe(concat("bundle.js"))
    .pipe(gulp.dest("./dist/"));
});
```