
window._trackJs = {
    token: "" // PUT YOUR TOKEN HERE
};
 
require("trackJs");

// uses browserify-shim to put trackjs on global window object - can use from anywhere
trackJs.track("Browserify works!");  // Manual tracking

