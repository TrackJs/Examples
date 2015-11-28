### Browserify with TrackJS NPM package
This is an example showing how to use the TrackJS NPM package with Browserify.

#### Running the example

Be sure to set your token in the configuration object in `/scripts/main.js`

{% highlight bash %}
# If it's not already installed
npm install --global browserify
npm install --global http-server

npm install

browserify scripts/main.js -o dist/bundle.js

http-server
# Navigate to localhost:8080
{% endhighlight %}
