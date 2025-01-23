import { TrackJSServer } from "trackjs-nextjs";

export async function register() {
  TrackJSServer.install({
    token: "YOUR_TOKEN"
  });
}