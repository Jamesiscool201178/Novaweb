document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CLIENT LOGIN BUTTON
    ========================= */

    async function updateClientLogin() {

        const clientLogin =
            document.getElementById("clientLogin");

        if (!clientLogin) return;

        try {

            const { data, error } =
                await supabaseClient.auth.getSession();

            if (error) {
                console.error(error);
                return;
            }

            if (data.session) {

                // User is logged in
                clientLogin.style.display = "none";

            } else {

                // User is logged out
                clientLogin.style.display = "inline-block";

            }

        } catch (error) {

            console.error(
                "Login status error:",
                error
            );

        }

    }


    /* =========================
       WEBSITE STATUS
    ========================= */

    async function checkWebsiteStatus() {

        const statusText =
            document.getElementById("statusText");

        const statusDot =
            document.getElementById("statusDot");

        if (!statusText) return;

        try {

            const response = await fetch(
                window.location.href,
                {
                    method: "HEAD",
                    cache: "no-store"
                }
            );

            if (response.ok) {

                statusText.textContent =
                    "Online";

                if (statusDot) {
                    statusDot.classList.add("online");
                }

            } else {

                statusText.textContent =
                    "Offline";

                if (statusDot) {
                    statusDot.classList.remove("online");
                }

            }

        } catch (error) {

            statusText.textContent =
                "Offline";

            if (statusDot) {
                statusDot.classList.remove("online");
            }

        }

    }


    /* =========================
       WEBSITE REQUEST FORM
    ========================= */

    const requestForm =
        document.getElementById("requestForm");

    if (requestForm) {

        requestForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const submitButton =
                    requestForm.querySelector(
                        "button[type='submit']"
                    );


                try {

                    /* CHECK LOGIN */

                    const { data: sessionData } =
                        await supabaseClient.auth
                            .getSession();


                    if (!sessionData.session) {

                        alert(
                            "Please log in before submitting a website request."
                        );

                        window.location.href =
                            "login.html";

                        return;

                    }


                    const user =
                        sessionData.session.user;


                    if (submitButton) {

                        submitButton.disabled =
                            true;

                        submitButton.textContent =
                            "Submitting...";

                    }


                    /* GET FORM VALUES */

                    const getValue = (id) => {

                        const element =
                            document.getElementById(id);

                        return element
                            ? element.value.trim()
                            : "";

                    };


                    const projectName =
                        getValue("websiteName");

                    const websiteType =
                        getValue("websiteType");

                    const description =
                        getValue("description");

                    const pages =
                        getValue("pages");

                    const features =
                        getValue("features");

                    const deadline =
                        getValue("deadline");

                    const examples =
                        getValue("examples");

                    const extra =
                        getValue("extra");

                    const name =
                        getValue("name");

                    const discord =
                        getValue("discord");

                    const email =
                        getValue("email");


                    /* CHECK REQUIRED FIELDS */

                    if (
                        !name ||
                        !email ||
                        !projectName ||
                        !description
                    ) {

                        throw new Error(
                            "Please complete all required fields."
                        );

                    }


                    /* CREATE PROJECT */

                    const { data: project, error } =
                        await supabaseClient
                            .from("projects")
                            .insert({

                                project_code:
                                    "NW-" +
                                    crypto
                                        .randomUUID()
                                        .substring(0, 8)
                                        .toUpperCase(),

                                customer_id:
                                    user.id,

                                name:
                                    name,

                                discord:
                                    discord,

                                email:
                                    email,

                                website_name:
                                    projectName,

                                website_type:
                                    websiteType,

                                description:
                                    description,

                                pages:
                                    pages,

                                features:
                                    features,

                                deadline:
                                    deadline || null,

                                examples:
                                    examples,

                                extra:
                                    extra,

                                status:
                                    "Request Received",

                                progress:
                                    0

                            })
                            .select()
                            .single();


                    if (error) {

                        console.error(
                            "Supabase project error:",
                            error
                        );

                        throw new Error(
                            error.message
                        );

                    }


                    console.log(
                        "Project created:",
                        project
                    );


                    /* SUCCESS */

                    alert(
                        "Your website request has been submitted successfully!"
                    );


                    window.location.href =
                        "dashboard.html";


                } catch (error) {

                    console.error(
                        "Request submission error:",
                        error
                    );


                    alert(
                        "Something went wrong while submitting your request.\n\n" +
                        error.message
                    );


                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Submit Request";

                    }

                }

            }
        );

    }


    /* =========================
       RUN
    ========================= */

    updateClientLogin();

    checkWebsiteStatus();


    /* Check website status
       every 60 seconds */

    setInterval(
        checkWebsiteStatus,
        60000
    );

});