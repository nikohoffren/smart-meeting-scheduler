let clientId = process.env.CLIENT_ID;
let clientSecret = process.env.CLIENT_SECRET; // you should have this from Google's OAuth2 flow
let redirectUrl = chrome.identity.getRedirectURL();
let calendarId = "primary";
let maxResults = 10;
let timeMin = new Date().toISOString(); // Get events after now.
let accessToken;

const scopes = "https://www.googleapis.com/auth/calendar";

// Initialize Google OAuth on window load
window.onload = initGoogleOAuth;

function initGoogleOAuth() {
    // Start Google auth flow.
    chrome.identity.getAuthToken({ interactive: true, scopes: [scopes] }, function (token) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            return;
        }
        // Use the obtained token
        accessToken = token;
        // Fetch the calendar events
        fetchEvents(accessToken);
    });
}

function fetchEvents(accessToken) {
    fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=${maxResults}&timeMin=${timeMin}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log("Fetched events:", data.items);
        })
        .catch(error => {
            console.error("Failed to fetch events:", error);
        });
}

function handleAuthClick() {
    let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUrl)}`;
    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, redirectUrlWithCode => {
        let url = new URL(redirectUrlWithCode);
        let code = url.searchParams.get("code");

        // Now exchange the authorization code for an access token.
        fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: JSON.stringify({
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUrl,
                grant_type: "authorization_code",
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => {
                accessToken = data.access_token;
                // Now you can use the access token to make authorized API requests.
            });
    });
}
