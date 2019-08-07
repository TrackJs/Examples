const express = require("express");
const { TrackJS } = require("trackjs-node");
const pkg = require("./package.json");

TrackJS.install({
  token: "your_token",
  onError: (payload) => {
    // we caught an error!
    // you can manipulate it by inspecting the *payload*
    // @see https://docs.trackjs.com/data-api/capture/#request-payload

    console.log("we caught an error", payload);

    // returning false will ignore the error
    return true;
  },
  metadata: {
    // custom attributes that help you understand errors in your environment
    "my-key": "my-value"
  },
  version: pkg.version
});

const app = express()
  .use(TrackJS.Handlers.expressRequestHandler())

  .get("/api/ok", (req, res, next) => {
    res.sendStatus(200);
    next();
  })

  .get("/api/error", (req, res, next) => {
    throw new Error("Oops!");
  })

  .get("*", express.static("public"))

  .use(TrackJS.Handlers.expressErrorHandler({ next: false }))
  .listen(3000);
