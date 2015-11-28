
window._trackJs = {
    token: "" // PUT YOUR TOKEN HERE
};
 
require("trackJs"); // uses browserify-shim to put trackjs on global window object - can use from anywhere

var Car = require("./car");


trackJs.track("Browserify works!");  // Manual tracking

var car = new Car("Tesla", "Model S");
car.drive();

