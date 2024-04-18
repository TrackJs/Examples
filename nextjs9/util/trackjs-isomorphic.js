/**
 * Switch between browser and server environment and return the appropriate
 * TrackJS agent.
 */
module.exports = process.browser ?
  require("trackjs") :
  require("trackjs-node");
