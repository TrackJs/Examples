### Webpack with TrackJS NPM Package
This is an example showing how to use the TrackJS NPM package with Webpack.

#### Running the example

Be sure to set your token on the configuration object in `/scripts/main.js`

```bash 
# If it's not already installed
npm install --global webpack
npm install --global http-server

npm install
webpack
http-server
# Navigate to localhost:8080
```

#### How does it work?

We make use of the `exports-loader` to export the trackJs variable from the npm package.  

```javascript
module: {
    loaders:[{
        test: require.resolve("trackjs"),
        loader: "exports?trackJs"
    }]
}
```

You can either to this
```javascript
require("trackjs");
trackJs.track("Hello");
```

or

```javascript
var trackJs = require("trackjs");
trackJs.track("Hello");
```

Whichever you prefer.