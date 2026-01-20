import App from "next/app";
import { TrackJS } from "trackjs-nextjs";
import '../app/globals.css'

// Server side is already installed, only install on client side components
if (typeof window !== "undefined" && !TrackJS.isInstalled()) {
    TrackJS.install({
        token: "YOUR_TOKEN",
    });
}

// The default next.js app or your custom app here if you have one
export default App;