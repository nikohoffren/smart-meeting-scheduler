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

                    // Handle the initial sign-in state
                    updateSigninStatus(GoogleAuth.isSignedIn.get());
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

        // Show a "Sign Out" button
        const signOutButton = document.getElementById("sign-out-button");
        signOutButton.style.display = "block";

        // Hide the "Sign In" button
        const signInButton = document.getElementById("sign-in-button");
        signInButton.style.display = "none";

        // Get the current user's Google Calendar service
        const calendarService = gapi.client.calendar;

        // Get the meeting form data
        const meetingForm = document.getElementById("meeting-form");
        const formData = new FormData(meetingForm);
        const meetingData = Object.fromEntries(formData.entries());

        // Create the meeting event
        const event = {
            summary: meetingData.title,
            description: meetingData.description,
            attendees: meetingData.attendees
                .split(",")
                .map((email) => ({ email })),
            start: {
                dateTime: new Date(
                    `${meetingData["start-date"]}T00:00:00`
                ).toISOString(),
                timeZone: "YOUR_TIME_ZONE", // Replace with the desired time zone
            },
            end: {
                dateTime: new Date(
                    `${meetingData["end-date"]}T23:59:59`
                ).toISOString(),
                timeZone: "YOUR_TIME_ZONE", // Replace with the desired time zone
            },
        };

        // Call the Google Calendar API to insert the event
        calendarService.events
            .insert({
                calendarId: "primary", // Use 'primary' for the user's primary calendar
                resource: event,
            })
            .then((response) => {
                console.log("Event created:", response);
                // Display a success message or perform any necessary actions
            })
            .catch((error) => {
                console.error("Error creating event:", error);
                // Display an error message or handle the error appropriately
            });
    } else {
        // User is not signed in.

        // Show a "Sign In" button
        const signInButton = document.getElementById("sign-in-button");
        signInButton.style.display = "block";

        // Hide the "Sign Out" button
        const signOutButton = document.getElementById("sign-out-button");
        signOutButton.style.display = "none";
    }
}
