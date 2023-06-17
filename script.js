let clientId = process.env.CLIENT_ID;
let calendarId = "primary";
let maxResults = 10;
let timeMin = new Date().toISOString();
let accessToken;
let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let attendeesArray = [];
let busy = [];
let freeSlots = [];
let selectedWorkingHours = "Anytime";
let settingsButton = document.getElementById("settings-button");
let saveSettingsButton = document.getElementById("save-settings-button");
let settingsModal = document.getElementById("settings-modal");
let dropdownButton = document.getElementById("dropdown-btn");
let dropdownMenu = document.querySelector(".origin-top-right");
let preferenceInput = document.getElementById("preference");

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

const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/userinfo.email",
];

async function getUserEmail(token) {
    const response = await fetch(
        "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const data = await response.json();
    return data.email;
}

function getAccessToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken(
            {
                interactive: true,
                scopes: [
                    "https://www.googleapis.com/auth/calendar",
                    "https://www.googleapis.com/auth/userinfo.email",
                ],
            },
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
window.onload = function () {
    initGoogleOAuth();

    getAccessToken()
        .then((token) => {
            return getUserEmail(token);
        })
        .then((email) => {
            document.getElementById("attendee-1").value = email;
        })
        .catch((error) => {
            console.error(error);
        });
};

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
        heading.classList.add(
            "text-2xl",
            "font-semibold",
            "mb-8",
            "text-gray-700"
        );
        upcomingEvents.appendChild(heading);
    }

    events.forEach((event) => {
        const eventElement = document.createElement("div");
        eventElement.classList.add(
            "event",
            "bg-white",
            "shadow-md",
            "my-4",
            "p-6",
            "rounded-lg",
            "w-full",
            "md:w-3/4",
            "lg:w-1/2",
            "xl:w-1/3"
        );

        const titleElement = document.createElement("h2");
        titleElement.textContent = event.summary;
        titleElement.classList.add(
            "text-xl",
            "font-bold",
            "mb-4",
            "text-gray-800"
        );
        eventElement.appendChild(titleElement);

        // Creating a container for the time details
        const timeContainer = document.createElement("div");
        timeContainer.classList.add("flex", "flex-col", "space-y-2", "mb-4");

        // Creating and adding the start time element
        const startTimeElement = document.createElement("p");
        startTimeElement.textContent = `Starts: ${new Date(
            event.start.dateTime
        ).toLocaleString()}`;
        startTimeElement.classList.add("text-gray-600", "text-base");
        timeContainer.appendChild(startTimeElement);

        // Creating and adding the end time element
        const endTimeElement = document.createElement("p");
        endTimeElement.textContent = `Ends: ${new Date(
            event.end.dateTime
        ).toLocaleString()}`;
        endTimeElement.classList.add("text-gray-600", "text-base");
        timeContainer.appendChild(endTimeElement);

        eventElement.appendChild(timeContainer);

        const attendeesContainer = document.createElement("div");
        attendeesContainer.classList.add(
            "flex",
            "flex-col",
            "space-y-2",
            "mb-4"
        );

        const attendeesLabel = document.createElement("h3");
        attendeesLabel.textContent = "Attendees:";
        attendeesLabel.classList.add("text-gray-600", "font-bold", "text-base");
        attendeesContainer.appendChild(attendeesLabel);

        event.attendees.forEach((attendee) => {
            const attendeeElement = document.createElement("p");
            attendeeElement.textContent = attendee.email;
            attendeeElement.classList.add("text-gray-600", "text-base");
            attendeesContainer.appendChild(attendeeElement);
        });

        eventElement.appendChild(attendeesContainer);

        const linkElement = document.createElement("a");
        linkElement.href = event.htmlLink;
        linkElement.textContent = "Open in Google Calendar";
        linkElement.target = "_blank";
        linkElement.classList.add(
            "text-blue-500",
            "underline",
            "hover:text-blue-700"
        );
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

function suggestBestTime(freeSlots) {
    const bestTimeContainer = document.querySelector("#best-time");

    //* Clear previous suggestion
    bestTimeContainer.innerHTML = "";

    if (freeSlots.length > 0) {
        const heading = document.createElement("h2");
        heading.textContent = "Suggested Time Slot";
        heading.classList.add("text-lg", "font-bold", "mb-2");
        bestTimeContainer.appendChild(heading);

        const timeElement = document.createElement("p");
        timeElement.textContent = `Best Available Time: ${new Date(
            freeSlots[0]
        ).toLocaleString()}`;
        timeElement.classList.add("mb-4", "text-gray-600");
        bestTimeContainer.appendChild(timeElement);
    } else {
        bestTimeContainer.textContent = "No available slots found.";
    }
}

function displayAvailableSlots(freeSlots) {
    const slotsContainer = document.querySelector("#slots");

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
    suggestBestTime(freeSlots);
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

                busy = data.calendars[attendeesArray[0].id].busy;

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
                console.log("Busy slots:", busy);
                console.log("Free slots:", freeSlots);

                displayAvailableSlots(freeSlots);
            })
            .catch((error) => {
                console.error("Failed to fetch free/busy information:", error);
            });
    });
}

async function createEvent(event) {
    let eventJson = JSON.stringify(event);

    //* POST request to Google Calendar API
    const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: eventJson,
        }
    );
    const data = await response.json();
    console.log("Event created:", data);
    //* Open the event in a new tab
    window.open(data.htmlLink, "_blank");
    let newBusySlot = {
        start: data.start.dateTime,
        end: data.end.dateTime,
    };
    busy.push(newBusySlot);
    return data;
}

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

document
    .querySelector("#check-availability-btn")
    .addEventListener("click", async (e) => {
        e.preventDefault();

        let attendees = Array.from(
            document.querySelectorAll(".attendee"),
            (input) => input.value
        );
        let startDate = new Date(document.querySelector("#start-date").value);
        let duration = document.querySelector("#duration").value;

        attendeesArray = attendees.map(function (email) {
            return { id: email.trim() };
        });

        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        freeSlots = [];

        await checkAvailability(
            startDate,
            endDate,
            attendeesArray,
            duration,
            selectedWorkingHours
        );

        suggestBestTime(freeSlots);
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
                console.error("Error name:", error.name);
                console.error("Error message:", error.message);
                console.error("Error stack:", error.stack);
                document.querySelector("#submit-btn").disabled = false;
            });
    } else {
        console.log("Please select a slot before submitting the form.");
        document.querySelector("#submit-btn").disabled = false;
    }
});

document.querySelector("#add-attendee").addEventListener("click", function () {
    const attendeeInput = document.createElement("input");
    attendeeInput.className =
        "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline attendee";
    attendeeInput.type = "text";
    attendeeInput.name = "attendees[]";
    attendeeInput.placeholder = "Enter an email address";
    attendeeInput.required = true;

    const removeButton = document.createElement("button");
    removeButton.innerHTML = "Remove";
    removeButton.type = "button";

    removeButton.classList.add(
        "px-2",
        "py-1",
        "bg-red-500",
        "text-white",
        "rounded-md",
        "shadow",
        "hover:bg-red-600",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-offset-2",
        "focus:ring-red-500",
        "ml-2",
        "mt-1"
    );

    removeButton.addEventListener("click", function () {
        this.previousSibling.remove();
        this.remove();
    });

    const extraAttendees = document.getElementById("extra-attendees");
    extraAttendees.appendChild(attendeeInput);
    extraAttendees.appendChild(removeButton);
});

dropdownButton.addEventListener("click", function () {
    dropdownMenu.classList.toggle("hidden");
});
