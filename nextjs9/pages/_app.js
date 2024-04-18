/**
 * Overriding the default _app allows us to insert a global `componentDidCatch`
 * error handler into React. This may run client- or server-side, so we need
 * to use an isomorphic adapter to switch between agents.
 */

import App from "next/app";
import { TrackJS } from "../util/trackjs-isomorphic.js";

if (!TrackJS.isInstalled()) {
  TrackJS.install({
    token: "your_token",
    onError: (payload) => {
      // we caught an error!
      // you can manipulate it by inspecting the *payload*
      // @see https://docs.trackjs.com/data-api/capture/#request-payload

      console.log("we caught an error. See the integration in _app.js for details.", payload);

      // returning false will ignore the error
      return true;
    }
  });
}

class MyApp extends App {

  componentDidCatch(error, errorInfo) {
    TrackJS.track(error);
    this.setState({ error });
    // Anything else you want to do with the error.
  }

  render() {
    const { Component, pageProps } = this.props;
    return <Component {...pageProps} />
  }
}

export default MyApp;
