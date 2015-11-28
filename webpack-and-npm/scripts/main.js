
window._trackJs = {
    token: "" // PUT YOUR TOKEN HERE
};

var trackJs = require("trackjs");
// `trackJs` is now globally available as well, so subsequent modules need not explicitly require it.

// Test to make sure it's working
trackJs.track("Webpack works!");  // Manual tracking

// Load any other modules or do application related things