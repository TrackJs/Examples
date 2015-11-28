### Browserify with TrackJS NPM package
This is an example showing how to use the TrackJS NPM package with Browserify.

#### Running the example

Be sure to set your token in the configuration object in `/scripts/main.js`

```bash 
# If it's not already installed
npm install --global browserify
npm install --global http-server

npm install

browserify scripts/main.js -o dist/bundle.js

http-server
# Navigate to localhost:8080
```

#### What makes it work?

TrackJS can be loaded any number of ways, but it works best when it's globally available.  To facilitate this we use the `browserify-shim` to load TrackJS and put it on window.

```javascript
// package.json
"browserify-shim": {
    "trackjs": "trackJs"
},
```

So now when we do a `require("trackjs")` the trackJs object becomes available globally and we need not require it all the time.
