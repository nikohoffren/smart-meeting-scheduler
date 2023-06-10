let clientId = process.env.CLIENT_ID;
let calendarId = "primary";
let maxResults = 10;
let timeMin = new Date().toISOString();
let accessToken;
let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let attendeesArray = [];
let selectedWorkingHours = "Anytime";

const workingHoursOptions = {
    Anytime: "Anytime",
    "Morning (8am - 12pm)": "Morning",
    "Afternoon (12pm - 5pm)": "Afternoon",
    "Evening (5pm - 9pm)": "Evening",
};

const workingHours = {
    Anytime: { start: 0, end: 24 },
    Morning: { start: 8, end: 12 },
    Afternoon: { start: 12, end: 17 },
    Evening: { start: 17, end: 21 },
};

const scopes = "https://www.googleapis.com/auth/calendar";

function getAccessToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken(
            { interactive: true, scopes: [scopes] },
            (token) => {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                    reject(chrome.runtime.lastError);
                    return;
                }
                resolve(token);
            }
        );
    });
}

//* Initialize Google OAuth on window load
window.onload = initGoogleOAuth;

function initGoogleOAuth() {
    getAccessToken()
        .then((token) => {
            accessToken = token;
            fetchEvents();
        })
        .catch((error) => console.log(error));
}

function displayEvents(events) {
    const upcomingEvents = document.getElementById("upcoming-events");

    upcomingEvents.innerHTML = "";

    upcomingEvents.classList.add(
        "flex",
        "flex-col",
        "items-center",
        "justify-center"
    );

    if (events.length > 0) {
        const heading = document.createElement("h1");
        heading.textContent = "Upcoming Events";
        heading.classList.add("text-lg", "font-bold", "mb-4");
        upcomingEvents.appendChild(heading);
    }

    events.forEach((event) => {
        const eventElement = document.createElement("div");
        eventElement.classList.add(
            "event",
            "bg-white",
            "shadow",
            "my-4",
            "p-4",
            "rounded-md"
        );

        const titleElement = document.createElement("h2");
        titleElement.textContent = event.summary;
        titleElement.classList.add("text-lg", "font-bold", "mb-2");
        eventElement.appendChild(titleElement);

        const timeElement = document.createElement("p");
        timeElement.textContent = `Starts: ${new Date(
            event.start.dateTime
        ).toLocaleString()} Ends: ${new Date(
            event.end.dateTime
        ).toLocaleString()}`;
        timeElement.classList.add("mb-4", "text-gray-600");
        eventElement.appendChild(timeElement);

        const linkElement = document.createElement("a");
        linkElement.href = event.htmlLink;
        linkElement.textContent = "Open in Google Calendar";
        linkElement.target = "_blank";
        linkElement.classList.add("text-blue-500", "underline");
        eventElement.appendChild(linkElement);

        upcomingEvents.appendChild(eventElement);
    });
}

function fetchEvents() {
    getAccessToken()
        .then((token) => {
            fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=${maxResults}&timeMin=${timeMin}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
                .then((response) => response.json())
                .then((data) => {
                    console.log("Fetched events:", data.items);
                    displayEvents(data.items);
                })
                .catch((error) => {
                    console.error("Failed to fetch events:", error);
                });
        })
        .catch((error) => {
            console.error("Failed to get access token:", error);
        });
}

function displayAvailableSlots(freeSlots) {
    const slotsContainer = document.getElementById("slots");

    //* Clear previous slots
    slotsContainer.innerHTML =
        "<label class='block text-gray-700 text-sm font-bold mb-2'>Available Slots</label>";

    freeSlots.forEach((slot, index) => {
        const radioWrapper = document.createElement("div");
        radioWrapper.className = "mt-2";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.id = `slot${index}`;
        radio.name = "slot";
        radio.value = slot;
        radio.required = true;

        const label = document.createElement("label");
        label.htmlFor = `slot${index}`;
        label.textContent = new Date(slot).toLocaleString();
        label.className = "ml-2";

        radioWrapper.appendChild(radio);
        radioWrapper.appendChild(label);
        slotsContainer.appendChild(radioWrapper);
    });
}

function checkAvailability(
    startDate,
    endDate,
    attendeesArray,
    duration,
    workingHoursOption
) {
    //* Setting the start and end time according to the selected working hours
    startDate.setHours(workingHours[workingHoursOption].start, 0, 0, 0);
    endDate.setHours(workingHours[workingHoursOption].end, 0, 0, 0);

    let availabilityRequest = {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        timeZone: userTimeZone,
        items: attendeesArray,
    };

    getAccessToken().then((token) => {
        fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(availabilityRequest),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Freebusy response:", data);

                let busy = data.calendars[attendeesArray[0].id].busy;
                let freeSlots = [];

                let currentSlot = new Date(startDate);
                let endWorkingHours = new Date(endDate);

                const addFreeSlots = (startSlot, endSlot, durationMinutes) => {
                    console.log(
                        `Add free slots from ${startSlot} to ${endSlot}`
                    );
                    let nextSlotEndTime = new Date(
                        startSlot.getTime() + durationMinutes * 60000
                    );
                    while (
                        startSlot < endSlot &&
                        nextSlotEndTime <= endSlot &&
                        startSlot.getHours() <
                            workingHours[workingHoursOption].end
                    ) {
                        console.log(`Adding slot: ${startSlot}`);
                        freeSlots.push(new Date(startSlot).toISOString());
                        startSlot.setMinutes(
                            startSlot.getMinutes() + Number(duration)
                        );
                        nextSlotEndTime = new Date(
                            startSlot.getTime() + durationMinutes * 60000
                        );
                        console.log(`Next slot: ${startSlot}`);
                    }
                };

                if (!Array.isArray(busy) || busy.length === 0) {
                    console.log("No busy slots found.");
                    addFreeSlots(currentSlot, endWorkingHours, duration);
                } else {
                    if (
                        busy.length === 1 &&
                        new Date(busy[0].start).getTime() ===
                            startDate.getTime() &&
                        new Date(busy[0].end).getTime() === endDate.getTime()
                    ) {
                        console.log("The whole day is busy.");
                    } else {
                        busy.forEach((busySlot, i) => {
                            let busySlotStart = new Date(busySlot.start);
                            let busySlotEnd = new Date(busySlot.end);

                            addFreeSlots(currentSlot, busySlotStart, duration);

                            currentSlot = busySlotEnd;
                        });

                        if (
                            currentSlot.getHours() <
                            workingHours[workingHoursOption].end
                        ) {
                            addFreeSlots(
                                currentSlot,
                                endWorkingHours,
                                duration
                            );
                        }
                    }
                }

                console.log("Start date:", startDate);
                console.log("End date:", endDate);
                console.log("Working hours option:", workingHoursOption);
                console.log("Working hours:", workingHours[workingHoursOption]);
                console.log("Current slot:", currentSlot);
                console.log("End working hours:", endWorkingHours);

                displayAvailableSlots(freeSlots);
            })
            .catch((error) => {
                console.error("Failed to fetch free/busy information:", error);
            });
    });
}

function createEvent(event) {
    let eventJson = JSON.stringify(event);

    //* POST request to Google Calendar API
    return fetch(
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
            //* Open the event in a new tab
            window.open(data.htmlLink, "_blank");

            let newBusySlot = {
                start: data.start.dateTime,
                end: data.end.dateTime,
            };

            busy.push(newBusySlot);

            return data;
        });
}

let dropdownMenu = document.querySelector(".hidden");

document.querySelectorAll("[role='menuitem']").forEach((item) => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        selectedWorkingHours = workingHoursOptions[e.target.textContent];
        console.log("Selected Working Hours:", selectedWorkingHours);
        document.querySelector("#dropdown-btn").textContent =
            e.target.textContent;
        dropdownMenu.classList.add("hidden");
    });
});

document.querySelector("#dropdown-btn").addEventListener("click", function (e) {
    e.preventDefault();
    dropdownMenu.classList.toggle("hidden");
});

document
    .querySelector("#check-availability-btn")
    .addEventListener("click", (e) => {
        e.preventDefault();

        let attendees = document.querySelector("#attendees").value.split(",");
        let startDate = new Date(document.querySelector("#start-date").value);
        let duration = document.querySelector("#duration").value;

        attendeesArray = attendees.map(function (email) {
            return { id: email.trim() };
        });

        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        checkAvailability(
            startDate,
            endDate,
            attendeesArray,
            duration,
            selectedWorkingHours
        );
    });

document.querySelector("#meeting-form").addEventListener("submit", (e) => {
    e.preventDefault();

    let title = document.querySelector("#title").value;
    let description = document.querySelector("#description").value;
    let duration = document.querySelector("#duration").value;

    document.querySelector("#submit-btn").disabled = true;

    let selectedSlot = document.querySelector('input[name="slot"]:checked');
    let slot;
    if (selectedSlot) {
        slot = selectedSlot.value;
    } else {
        console.log("Please select a slot before submitting the form.");
        return;
    }

    if (slot) {
        let eventStartDate = new Date(slot);
        let eventEndDate = new Date(
            eventStartDate.getTime() + duration * 60000
        );

        let event = {
            summary: title,
            description: description,
            start: {
                dateTime: eventStartDate.toISOString(),
                timeZone: userTimeZone,
            },
            end: {
                dateTime: eventEndDate.toISOString(),
                timeZone: userTimeZone,
            },
            attendees: attendeesArray.map(function (attendee) {
                return { email: attendee.id };
            }),
        };

        createEvent(event)
            .then(() => {
                document.querySelector("#submit-btn").disabled = false;
            })
            .catch((error) => {
                console.error("Failed to create event:", error);
                document.querySelector("#submit-btn").disabled = false;
            });
    } else {
        console.log("Please select a slot before submitting the form.");
        document.querySelector("#submit-btn").disabled = false;
    }
});
