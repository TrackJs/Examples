/**
 * Overriding the default _app allows us to insert a global `componentDidCatch`
 * error handler into React. This may run client- or server-side, so we need
 * to use an isomorphic adapter to switch between agents.
 */

import React from 'react';
import App, { Container } from 'next/app';
import { TrackJS } from '../util/trackjs-isomorphic';

// Because this may run multiple times due to client-side loading or server pages
// we need to check that we have not already installed into the environment.
if (!TrackJS.isInstalled()) {
  TrackJS.install({
    token: "your_token",
    onError: (payload) => {
      // we caught an error!
      // you can manipulate it by inspecting the *payload*
      // @see https://docs.trackjs.com/data-api/capture/#request-payload

      console.log("we caught an error", payload);

      // returning false will ignore the error
      return true;
    }
  });
}

class MyApp extends App {

  static async getInitialProps({ Component, ctx }) {
      let pageProps = {};

      if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx);
      }

      return { pageProps };
  }

  componentDidCatch (error, errorInfo) {
    // This is where TrackJS hooks in. The rest of this class is boilerplate.
    TrackJS.track(error);
    this.setState({ error });
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <Component {...pageProps} />
      </Container>
    );
  }
}

export default MyApp;
