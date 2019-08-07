/**
 * Overriding the default _error gives another opportunity to collect the error,
 * and allows you to customize the user experience.
 */

import React from 'react';
import { TrackJS } from '../util/trackjs-isomorphic';

class Error extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null;
    TrackJS.track(err);
    return { statusCode };
  }

  render() {
    return (
      <div>
        <h1>Oh No!</h1>
        <p>
          {this.props.statusCode
            ? `An error ${this.props.statusCode} occurred on server`
            : 'An error occurred on client'}
        </p>
      </div>
    );
  }
}

export default Error;
