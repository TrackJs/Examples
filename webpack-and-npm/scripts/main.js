
window._trackJs = {
    token: "" // PUT YOUR TOKEN HERE
};

var trackJs = require("trackjs");

// Test to make sure it's working
trackJs.track("Webpack works!");  // Manual tracking


// Implicit tracking - this code contains a bug which will cause an error to be tracked.
var Car = require("./car");
var car = new Car("Tesla", "Model S");
car.drive();
