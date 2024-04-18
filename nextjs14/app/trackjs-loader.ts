/**
 * trackjs-loader
 * This file enables polymophism between the server-side and client-side of NextJS
 * by detecting whether `window` exists and returning the appropriate agent.
 */

export const TrackJS = (typeof window !== "undefined") ?
  require("trackjs").TrackJS :
  require("trackjs-node").TrackJS;

export function TrackJSInstall() {
  if (!TrackJS.isInstalled()) {
    TrackJS.install({
      token: "YOUR_TOKEN",
      // For demonstration purposes only.
      onError: (payload: { message: any; }) => { console.info(`TrackJS recorded "${payload.message}"`); return true; }
    });
    console.info("TrackJS Installed");
  }
}
