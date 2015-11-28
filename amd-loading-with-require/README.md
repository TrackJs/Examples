### Using AMD/RequireJs to load the tracker script
This is an example showing how to use RequireJS to configure and load TrackJs.

#### Running the example

Be sure to set your token on the configuration option in `/scripts/trackerConfig.js`.

```bash 
# If it's not already installed
npm install --global http-server

http-server
# Navigate to localhost:8080
```

#### How does it work?

TrackJS needs a configuration object initialized before the script loads.  To accommodate this with Require we need to load a simple module first that contains all the configuration data, then load the tracker script itself.  Check out `/scripts/trackerConfig.js` for an example.

This will also work just fine with the r.js optimizer.

```html
<script>
    // The important thing is to load the config before the tracker script.  
    // Require will ensure they're executed in order
    require(["scripts/trackerConfig","scripts/tracker"], function (){
        trackJs.track("Using Require to load TrackJs tracker script")
    })
</script>
```
