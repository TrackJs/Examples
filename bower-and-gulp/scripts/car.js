

var Car = function (make, model){
	this.make = make;
	this.model = model;
}

Car.prototype = {
	start: function (){
		console.log(this.toString() + " is starting...");
	},

	toString: function(){
		return this.make + " " + this.model;
	},

	drive: function (){
		this.start();
		this.accelerate();
	}
}
