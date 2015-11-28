### Using JSPM to load and configure thr tracker script.
This is an example showing how to use RequireJS to configure and load TrackJs.

#### Running the example

Be sure to set your token on the configuration option in `/scripts/trackerConfig.js`.

```bash 
# If they're not already installed
npm install --global jspm

npm install
jspm install

jspm bundle-sfx scripts/main.js dist/build.js # bundle to a single file - other methods are supported as well.

http-server
# Navigate to localhost:8080
```
