// Make sure to import the configuration file first.
import "scripts/trackerConfig";
import "trackjs";
import Car from "scripts/car";

// Let's test to make sure things work
trackJs.track("This is a test using JSPM");

// This code has a bug in it which will cause an error to be tracked.
var car = new Car("Tesla", "Model S");
car.drive();


