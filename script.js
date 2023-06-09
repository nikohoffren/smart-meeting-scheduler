let clientId = process.env.CLIENT_ID;
let calendarId = "primary";
let maxResults = 10;
let timeMin = new Date().toISOString(); // Get events after now.
let accessToken;
let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const scopes = "https://www.googleapis.com/auth/calendar";

//* Initialize Google OAuth on window load
window.onload = initGoogleOAuth;

function initGoogleOAuth() {
    // Start Google auth flow.
    chrome.identity.getAuthToken(
        { interactive: true, scopes: [scopes] },
        (token) => {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
                return;
            }
            // Use the obtained token
            accessToken = token;
            // Fetch the calendar events
            fetchEvents(accessToken);
        }
    );
}

function fetchEvents(accessToken) {
    fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=${maxResults}&timeMin=${timeMin}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )
        .then((response) => response.json())
        .then((data) => {
            console.log("Fetched events:", data.items);
        })
        .catch((error) => {
            console.error("Failed to fetch events:", error);
        });
}

document.querySelector("#meeting-form").addEventListener("submit", (e) => {
    e.preventDefault(); // Prevents the default form submit action

    // Get form field values
    let title = document.querySelector("#title").value;
    let description = document.querySelector("#description").value;
    let attendees = document.querySelector("#attendees").value.split(",");
    let startDate = new Date(document.querySelector("#start-date").value);
    let duration = document.querySelector("#duration").value; // This should be in minutes

    // Create attendees array for the Google Calendar API
    let attendeesArray = attendees.map(function (email) {
        return { email: email.trim() }; // trim() removes any extra whitespace
    });

    // Calculate end date based on duration
    let endDate = new Date(startDate.getTime() + duration * 60000); // duration is in minutes, so multiply by 60,000 to convert it to milliseconds

    // Create event object
    let event = {
        summary: title,
        description: description,
        start: {
            dateTime: startDate.toISOString(), // Needs to be in ISO string format
            timeZone: userTimeZone, // Replace with user's timezone
        },
        end: {
            dateTime: endDate.toISOString(), // Needs to be in ISO string format
            timeZone: userTimeZone, // Replace with user's timezone
        },
        attendees: attendeesArray,
    };

    // Convert event object to JSON
    let eventJson = JSON.stringify(event);

    // POST request to Google Calendar API
    fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: eventJson,
        }
    )
        .then((response) => response.json())
        .then((data) => {
            console.log("Event created:", data);
            // Open the event in a new tab
            window.open(data.htmlLink, "_blank");
        })
        .catch((error) => {
            console.error("Failed to create event:", error);
        });
});
