/* =========================================
   NOVAWEB JAVASCRIPT
========================================= */


/* =========================================
   WEBSITE STATUS
========================================= */

const websiteStatus = document.getElementById("websiteStatus");
const statusTitle = document.getElementById("statusTitle");
const statusDescription = document.getElementById("statusDescription");
const statusTime = document.getElementById("statusTime");


const WEBSITE_URL =
    "https://jamesiscool201178.github.io/Novaweb/";


function updateStatus(status, message) {

    websiteStatus.classList.remove(
        "status-online",
        "status-offline",
        "status-checking"
    );


    if (status === "online") {

        websiteStatus.classList.add("status-online");

        statusTitle.textContent =
            "All Systems Operational";

        statusDescription.textContent =
            "NovaWeb is online and working normally.";

    }


    else if (status === "offline") {

        websiteStatus.classList.add("status-offline");

        statusTitle.textContent =
            "Website Offline";

        statusDescription.textContent =
            "NovaWeb is currently unavailable.";

    }


    else {

        websiteStatus.classList.add("status-checking");

        statusTitle.textContent =
            "Checking website...";

        statusDescription.textContent =
            message ||
            "We're checking the NovaWeb website.";

    }


    const now = new Date();

    statusTime.textContent =
        "Last checked: " +
        now.toLocaleTimeString();
}


/* =========================================
   CHECK WEBSITE
========================================= */

async function checkWebsiteStatus() {

    updateStatus(
        "checking",
        "Checking the NovaWeb website..."
    );


    try {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                8000
            );


        /*
            cache-busting prevents the browser from
            simply using an old cached response.
        */

        const checkURL =
            WEBSITE_URL +
            "?statusCheck=" +
            Date.now();


        const response =
            await fetch(
                checkURL,
                {
                    method: "GET",
                    cache: "no-store",
                    signal: controller.signal
                }
            );


        clearTimeout(timeout);


        if (response.ok) {

            updateStatus("online");

        } else {

            updateStatus("offline");

        }

    }


    catch (error) {

        updateStatus("offline");

    }

}


/* =========================================
   INITIAL STATUS CHECK
========================================= */

checkWebsiteStatus();


/*
    Check again every 60 seconds.
*/

setInterval(
    checkWebsiteStatus,
    60000
);


/* =========================================
   WEBSITE REQUEST FORM
========================================= */

const form =
    document.getElementById("projectForm");

const modal =
    document.getElementById("successModal");

const closeModal =
    document.getElementById("closeModal");

const requestNumber =
    document.getElementById("requestNumber");

const submitButton =
    form.querySelector(".submit-button");


/* =========================================
   REQUEST NUMBER
========================================= */

function generateTicketNumber() {

    return (
        "#NW-" +
        Math.floor(
            1000 +
            Math.random() * 9000
        )
    );

}


/* =========================================
   FORM SUBMISSION
========================================= */

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const ticket =
            generateTicketNumber();


        requestNumber.textContent =
            ticket;


        const data =
            new FormData(form);


        data.append(
            "Ticket Number",
            ticket
        );


        submitButton.disabled = true;

        submitButton.textContent =
            "Sending...";


        try {

            const response =
                await fetch(
                    form.action,
                    {
                        method: "POST",

                        body: data,

                        headers: {
                            Accept:
                                "application/json"
                        }
                    }
                );


            if (response.ok) {

                form.reset();

                modal.classList.add("show");

            }


            else {

                const result =
                    await response
                        .json()
                        .catch(
                            () => null
                        );


                const errorMessage =
                    result?.errors
                        ?.map(
                            error =>
                                error.message
                        )
                        .join("\n");


                alert(
                    errorMessage ||
                    "Something went wrong. Please try again."
                );

            }

        }


        catch (error) {

            alert(
                "Could not send your request. Please check your internet connection and try again."
            );

        }


        finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Submit Website Request →";

        }

    }
);


/* =========================================
   CLOSE SUCCESS MODAL
========================================= */

closeModal.addEventListener(
    "click",
    function () {

        modal.classList.remove(
            "show"
        );

    }
);


modal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === modal
        ) {

            modal.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================
   DEADLINE
========================================= */

const deadlineInput =
    document.getElementById("deadline");


if (deadlineInput) {

    const today =
        new Date();

    deadlineInput.min =
        today
            .toISOString()
            .split("T")[0];

}