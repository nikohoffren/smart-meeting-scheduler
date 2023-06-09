let clientId = "862708403559-2dipe86e77d825ha97orapnc5ks6fd6o.apps.googleusercontent.com";
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
