document.addEventListener("DOMContentLoaded", () => {

    // ================================
    // CLIENT LOGIN BUTTON
    // ================================

    const clientLogin = document.getElementById("clientLogin");

    if (clientLogin) {
        clientLogin.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }


    // ================================
    // WEBSITE STATUS
    // ================================

    async function checkWebsiteStatus() {
        const statusElement = document.getElementById("websiteStatus");
        const statusText = document.getElementById("statusText");
        const statusDot = document.getElementById("statusDot");

        if (!statusElement && !statusText && !statusDot) {
            return;
        }

        const websiteURL = window.location.origin;

        try {
            const response = await fetch(websiteURL, {
                method: "HEAD",
                cache: "no-store"
            });

            if (response.ok) {
                if (statusText) {
                    statusText.textContent = "Online";
                }

                if (statusDot) {
                    statusDot.classList.add("online");
                    statusDot.classList.remove("offline");
                }
            } else {
                throw new Error("Website unavailable");
            }

        } catch (error) {

            if (statusText) {
                statusText.textContent = "Offline";
            }

            if (statusDot) {
                statusDot.classList.add("offline");
                statusDot.classList.remove("online");
            }
        }
    }


    // ================================
    // WEBSITE REQUEST FORM
    // ================================

    const requestForm = document.getElementById("requestForm");

    if (requestForm) {

        requestForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const submitButton =
                requestForm.querySelector("button[type='submit']");

            try {

                // Check login
                const {
                    data: sessionData,
                    error: sessionError
                } = await supabaseClient.auth.getSession();

                if (sessionError) {
                    throw new Error(sessionError.message);
                }

                if (!sessionData.session) {

                    alert(
                        "You need to be logged in before submitting a website request."
                    );

                    window.location.href = "login.html";

                    return;
                }

                const user = sessionData.session.user;


                // Button loading
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = "Checking account...";
                }


                // ================================
                // CHECK CUSTOMER PROFILE
                // ================================

                const {
                    data: profile,
                    error: profileError
                } = await supabaseClient
                    .from("profiles")
                    .select("id")
                    .eq("id", user.id)
                    .maybeSingle();

                if (profileError) {
                    throw new Error(
                        "Could not check your customer profile: " +
                        profileError.message
                    );
                }


                // Create profile if missing
                if (!profile) {

                    const fullName =
                        user.user_metadata?.full_name ||
                        user.email?.split("@")[0] ||
                        "Customer";

                    const {
                        error: createProfileError
                    } = await supabaseClient
                        .from("profiles")
                        .insert({
                            id: user.id,
                            email: user.email,
                            full_name: fullName,
                            role: "customer"
                        });

                    if (createProfileError) {
                        throw new Error(
                            "Your customer profile could not be created: " +
                            createProfileError.message
                        );
                    }
                }


                // ================================
                // GET FORM VALUES
                // ================================

                if (submitButton) {
                    submitButton.textContent = "Submitting...";
                }

                const getValue = (id) => {

                    const element = document.getElementById(id);

                    return element
                        ? element.value.trim()
                        : "";
                };


                const name = getValue("name");
                const discord = getValue("discord");
                const email = getValue("email");
                const websiteName = getValue("websiteName");
                const websiteType = getValue("websiteType");
                const pages = getValue("pages");
                const description = getValue("description");
                const features = getValue("features");
                const deadline = getValue("deadline");
                const examples = getValue("examples");
                const extra = getValue("extra");


                // Required fields
                if (
                    !name ||
                    !email ||
                    !websiteName ||
                    !description
                ) {

                    throw new Error(
                        "Please complete all required fields."
                    );
                }


                // ================================
                // CREATE PROJECT CODE
                // ================================

                const projectCode =
                    "NW-" +
                    crypto
                        .randomUUID()
                        .substring(0, 8)
                        .toUpperCase();


                // ================================
                // SAVE PROJECT TO SUPABASE
                // ================================

                if (submitButton) {
                    submitButton.textContent = "Saving request...";
                }

                const {
                    error: projectError
                } = await supabaseClient
                    .from("projects")
                    .insert({

                        project_code: projectCode,

                        customer_id: user.id,

                        name: name,

                        discord: discord,

                        email: email,

                        website_name: websiteName,

                        website_type: websiteType,

                        description: description,

                        pages: pages,

                        features: features,

                        deadline: deadline || null,

                        examples: examples,

                        extra: extra,

                        status: "Request Received",

                        progress: 0
                    });


                if (projectError) {
                    throw new Error(projectError.message);
                }


                // ================================
                // SUCCESS
                // ================================

                alert(
                    "Your website request has been submitted successfully!\n\n" +
                    "Project ID: " +
                    projectCode +
                    "\n\nYou can now track your project from your dashboard."
                );


                // Send customer to dashboard
                window.location.href = "dashboard.html";


            } catch (error) {

                console.error(
                    "NovaWeb request error:",
                    error
                );


                alert(
                    "Something went wrong:\n\n" +
                    error.message
                );


                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Submit Request";
                }
            }
        });
    }


    // ================================
    // INITIAL WEBSITE STATUS CHECK
    // ================================

    checkWebsiteStatus();


    // Check every 60 seconds
    setInterval(
        checkWebsiteStatus,
        60000
    );

});