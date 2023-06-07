let GoogleAuth;

function initClient() {
    fetch("/config")
        .then((response) => response.json())
        .then((data) => {
            const apiKey = data.apiKey;
            const clientId = data.clientId;

            gapi.client
                .init({
                    apiKey: apiKey,
                    clientId: clientId,
                    scope: "https://www.googleapis.com/auth/calendar",
                    discoveryDocs: [
                        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                    ],
                })
                .then(function () {
                    GoogleAuth = gapi.auth2.getAuthInstance();

                    // Listen for sign-in state changes.
                    GoogleAuth.isSignedIn.listen(updateSigninStatus);
                });
        });
}

function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
        // User is authorized and has clicked "Sign out" button.
        GoogleAuth.signOut();
    } else {
        // User is not signed in. Start Google auth flow.
        GoogleAuth.signIn();
    }
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        // User is signed in.
        // You can call Google APIs on behalf of the user here.
    } else {
        // User is not signed in.
        // You can show a "Sign In" button here.
    }
}
