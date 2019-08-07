### Bundling TrackJS with Gulp
This is an example showing how to add TrackJS to a script bundle.  The bundle will be built using gulp.

#### Running the example

Be sure to set your token on the configuration object in `scripts/trackerConfig.js`

```bash 
# If it's not already installed
npm install --global gulp 

npm install
gulp run
# Navigate to localhost:8080
```


#### How does it work?

TrackJS requires that the global `_trackJs` configuration variable be initialized before TrackJS is loaded. 
To ensure that, when we bundle our scripts with Gulp we ensure that the `/scripts/trackerConfig.js` file is specified first, followed by the tracker, and then all subsequent files.

```javascript
gulp.task("bundle", function () {
    gulp.src(["./scripts/trackerConfig.js", "./scripts/tracker.js", "./scripts/*.js"]) 
    .pipe(uglify())
    .pipe(concat("bundle.js"))
    .pipe(gulp.dest("./dist/"));
});
```

This way TrackJS is initialized and watching before any application scripts load.