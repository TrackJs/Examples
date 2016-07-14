/// <reference path="./node_modules/trackjs/tracker.d.ts" />

/**
 * Setup for the Tracker script before it has loaded
 */
window._trackJs = {
    token: "PUT_YOUR_TOKEN_HERE",
    application: "YOUR_APPLICATION_KEY",
    onError: function (payload) {
        return true;
    }
}

/**
 * After the Tracker script tag has loaded, the trackJs
 * static namespace is available for calls.  
 */
trackJs.addMetadata("accountId", "1234");
trackJs.configure({
    userId: "user@example.com",
    sessionId: "session123"
});


