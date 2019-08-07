### Basic TrackJS example
This is a very simple example with no other configuration options other than the token being specified.  This is a good first start, though we recommend checking out the other, more advanced, examples for real world usage.

#### Running the example

Be sure to set your token on the configuration object in `index.html`.

```bash 
# if it's not already installed
npm install -g http-server

http-server .
# Load http://localhost:8080 in your browser

```

#### How does it work?
In the `<head>` tag we create a `_trackJs` global initialization object with token and other configuration values.  We then load the tracker script from the CDN.  When the script executes it looks for the `_trackJs` initialization variable and instantiates itself.  

(Note: You need not load TrackJS in the `<head>` tag, though we do recommend that you place our script as either the first script on the page, or the first script in your minified bundle. 

```html
<script type="text/javascript">
    window._trackJs = {
        token: "" // PUT YOUR TOKEN HERE
        // More configuration...
    };
</script>
<script type="text/javascript" src="https://d2zah9y47r7bi2.cloudfront.net/releases/current/tracker.js"></script>
```
