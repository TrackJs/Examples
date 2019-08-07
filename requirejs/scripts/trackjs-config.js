// Put your token and other configuration here
define([], function() {
    return {
        token: "your_token",
        onError: (payload) => {
            // we caught an error!
            // you can manipulate it by inspecting the *payload*
            // @see https://docs.trackjs.com/data-api/capture/#request-payload

            console.log("we caught an error", payload);

            // returning false will ignore the error
            return true;
        }
    };
})
