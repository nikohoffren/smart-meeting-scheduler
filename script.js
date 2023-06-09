let GoogleAuth;

const config = {
    apiKey: process.env.API_KEY,
    clientId: process.env.CLIENT_ID,
};

// Call loadClient when the page loads
window.onload = loadClient;

function loadClient() {
    // Load gapi and then call initClient
    gapi.load("client:auth2", initClient);
}

function initClient() {
    gapi.client
        .init({
            apiKey: config.apiKey,
            clientId: config.clientId,
            scope: "https://www.googleapis.com/auth/calendar",
            discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
        })
        .then(function () {
            GoogleAuth = gapi.auth2.getAuthInstance();

            // Listen for sign-in state changes.
            GoogleAuth.isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state
            updateSigninStatus(GoogleAuth.isSignedIn.get());
        })
        .catch((error) => {
            console.error("Failed to initialize client:", error);
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

function updateSigninStatus(isSignedIn) {}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        let script = document.createElement("script");
        script.src = url;

        script.onload = () => {
            resolve();
        };

        script.onerror = (error) => {
            reject(error);
        };

        document.body.appendChild(script);
    });
}
