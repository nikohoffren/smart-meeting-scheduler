<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Smart Meeting Scheduler</title>
        <link href="output.css" rel="stylesheet" />
        <script src="api.js" defer></script>
        <script src="dist/main.js" defer></script>
    </head>
    <body class="bg-gray-100">
        <div class="flex justify-center pt-20 px-8">
            <form
                id="meeting-form"
                class="w-full max-w-xl bg-white rounded-lg shadow-md px-12 pt-6 pb-8 mb-4"
            >
                <div class="flex">
                    <img
                        src="img/smart-meeting-scheduler-logo-128-128.jpg"
                        alt="Smart Meeting Scheduler logo"
                    />
                </div>

                <div class="mb-4">
                    <label
                        class="block text-gray-700 text-sm font-bold mb-2"
                        for="title"
                    >
                        Meeting Title
                    </label>
                    <input
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="text"
                        id="title"
                        name="title"
                        required
                    />
                </div>

                <div class="mb-4">
                    <label
                        class="block text-gray-700 text-sm font-bold mb-2"
                        for="description"
                    >
                        Description
                    </label>
                    <textarea
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="description"
                        type="text"
                        name="description"
                        required
                    ></textarea>
                </div>

                <div class="mb-4">
                    <label
                        class="block text-gray-700 text-sm font-bold mb-2"
                        for="attendees"
                    >
                        Attendees
                    </label>
                    <input
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="attendees"
                        name="attendees"
                        type="text"
                        placeholder="Enter email addresses separated by comma"
                        required
                    />
                </div>

                <div class="mb-4">
                    <label
                        class="block text-gray-700 text-sm font-bold mb-2"
                        for="start-date"
                    >
                        Preferred Start Date
                    </label>
                    <input
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="start-date"
                        name="start-date"
                        type="date"
                        required
                    />
                </div>

                <div>
                    <label
                        for="end-date"
                        class="block block text-gray-700 text-sm font-bold mb-2"
                        >Preferred End Date:</label
                    >
                    <input
                        type="date"
                        id="end-date"
                        name="end-date"
                        required
                        class="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                <div class="mb-4">
                    <label
                        class="block text-gray-700 text-sm font-bold mb-2"
                        for="duration"
                    >
                        Meeting Duration (minutes)
                    </label>
                    <input
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="duration"
                        name="duration"
                        type="number"
                        min="15"
                        step="15"
                        required
                    />
                </div>

                <div class="flex items-center justify-between">
                    <button
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Schedule Meeting
                    </button>
                </div>
            </form>
        </div>
    </body>
</html>