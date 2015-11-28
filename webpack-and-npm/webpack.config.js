module.exports = {
	entry: {
		"bundle": "./scripts/main.js"
	},
	output: {
		path: "./dist/",
		filename: "[name].js" 
	},
	module: {
		loaders:[{
			test: require.resolve("trackjs"),
			loader: "exports?trackJs"
		}]
	}
}