const express = require("express");
const next = require('next');
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

const dev = process.env.NODE_ENV === 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(TrackJS.Handlers.expressRequestHandler());

    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.use(TrackJS.Handlers.expressErrorHandler({ next: false }));

    server.listen(3000);
  });
