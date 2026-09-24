document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // CLIENT LOGIN BUTTON
    // ==========================================

    async function updateClientLogin() {
        const clientLogin = document.getElementById("clientLogin");

        if (!clientLogin) return;

        try {
            const { data, error } =
                await supabaseClient.auth.getSession();

            if (error) {
                console.error("Session error:", error);
                return;
            }

            if (data.session) {
                clientLogin.style.display = "none";
            } else {
                clientLogin.style.display = "inline-block";
            }

        } catch (error) {
            console.error("Login status error:", error);
        }
    }


    // ==========================================
    // WEBSITE STATUS
    // ==========================================

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

                statusText.textContent = "Online";

                if (statusDot) {
                    statusDot.classList.add("online");
                }

            } else {

                statusText.textContent = "Offline";

                if (statusDot) {
                    statusDot.classList.remove("online");
                }
            }

        } catch (error) {

            statusText.textContent = "Offline";

            if (statusDot) {
                statusDot.classList.remove("online");
            }
        }
    }


    // ==========================================
    // WEBSITE REQUEST FORM
    // ==========================================

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

                    // ==================================
                    // CHECK LOGIN
                    // ==================================

                    const {
                        data: sessionData,
                        error: sessionError
                    } = await supabaseClient.auth.getSession();


                    if (sessionError) {
                        throw new Error(
                            sessionError.message
                        );
                    }


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


                    // ==================================
                    // BUTTON
                    // ==================================

                    if (submitButton) {

                        submitButton.disabled = true;

                        submitButton.textContent =
                            "Checking account...";
                    }


                    // ==================================
                    // CHECK PROFILE
                    // ==================================

                    const {
                        data: profile,
                        error: profileError
                    } = await supabaseClient
                        .from("profiles")
                        .select("id")
                        .eq("id", user.id)
                        .maybeSingle();


                    if (profileError) {

                        console.error(
                            "Profile lookup error:",
                            profileError
                        );

                        throw new Error(
                            "Could not check your customer profile: " +
                            profileError.message
                        );
                    }


                    // ==================================
                    // CREATE PROFILE IF MISSING
                    // ==================================

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

                            console.error(
                                "Profile creation error:",
                                createProfileError
                            );

                            throw new Error(
                                "Your customer profile could not be created: " +
                                createProfileError.message
                            );
                        }
                    }


                    // ==================================
                    // BUTTON
                    // ==================================

                    if (submitButton) {

                        submitButton.textContent =
                            "Submitting...";
                    }


                    // ==================================
                    // GET FORM VALUES
                    // ==================================

                    const getValue = (id) => {

                        const element =
                            document.getElementById(id);

                        return element
                            ? element.value.trim()
                            : "";
                    };


                    const name =
                        getValue("name");

                    const discord =
                        getValue("discord");

                    const email =
                        getValue("email");

                    const websiteName =
                        getValue("websiteName");

                    const websiteType =
                        getValue("websiteType");

                    const pages =
                        getValue("pages");

                    const description =
                        getValue("description");

                    const features =
                        getValue("features");

                    const deadline =
                        getValue("deadline");

                    const examples =
                        getValue("examples");

                    const extra =
                        getValue("extra");


                    // ==================================
                    // REQUIRED FIELDS
                    // ==================================

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


                    // ==================================
                    // CREATE PROJECT
                    // ==================================

                    if (submitButton) {

                        submitButton.textContent =
                            "Saving request...";
                    }


                    const projectCode =
                        "NW-" +
                        crypto
                            .randomUUID()
                            .substring(0, 8)
                            .toUpperCase();


                    const {
                        data: project,
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

                            deadline:
                                deadline || null,

                            examples: examples,

                            extra: extra,

                            status:
                                "Request Received",

                            progress: 0
                        })
                        .select()
                        .single();


                    if (projectError) {

                        console.error(
                            "Project error:",
                            projectError
                        );

                        throw new Error(
                            projectError.message
                        );
                    }


                    console.log(
                        "Project created:",
                        project
                    );


                    // ==================================
                    // SEND EMAIL
                    // ==================================

                    if (submitButton) {

                        submitButton.textContent =
                            "Sending email...";
                    }


                    const {
                        data: emailResult,
                        error: emailError
                    } =
                        await supabaseClient.functions.invoke(
                            "send-project-request",
                            {
                                body: {

                                    name: name,

                                    discord: discord,

                                    email: email,

                                    websiteName:
                                        websiteName,

                                    websiteType:
                                        websiteType,

                                    pages: pages,

                                    description:
                                        description,

                                    features:
                                        features,

                                    deadline:
                                        deadline,

                                    examples:
                                        examples,

                                    extra: extra,

                                    projectCode:
                                        projectCode
                                }
                            }
                        );


                    if (emailError) {

                        console.error(
                            "Email function error:",
                            emailError
                        );

                        throw new Error(
                            "The request was saved, but the email could not be sent.\n\n" +
                            emailError.message
                        );
                    }


                    console.log(
                        "Email result:",
                        emailResult
                    );


                    // ==================================
                    // SUCCESS
                    // ==================================

                    alert(
                        "Your website request has been submitted successfully!\n\n" +
                        "Your request has been saved and sent to NovaWeb."
                    );


                    window.location.href =
                        "dashboard.html";
                }


                // ==================================
                // ERROR
                // ==================================

                catch (error) {

                    console.error(
                        "Request submission error:",
                        error
                    );


                    alert(
                        "Something went wrong:\n\n" +
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


    // ==========================================
    // START
    // ==========================================

    updateClientLogin();

    checkWebsiteStatus();

    setInterval(
        checkWebsiteStatus,
        60000
    );

});
/* ================================= */
/* ANIMATED STATISTICS */
/* ================================= */

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) {
                return;
            }

            const counter = entry.target;

            const target =
                Number(counter.dataset.target);

            let current = 0;

            const duration = 1400;

            const startTime = performance.now();


            function animateCounter(currentTime) {

                const elapsed =
                    currentTime - startTime;

                const progress =
                    Math.min(elapsed / duration, 1);


                const eased =
                    1 - Math.pow(1 - progress, 3);


                current =
                    Math.floor(target * eased);


                counter.textContent = current;


                if (progress < 1) {

                    requestAnimationFrame(
                        animateCounter
                    );

                } else {

                    counter.textContent = target;

                }

            }


            requestAnimationFrame(
                animateCounter
            );


            observer.unobserve(counter);

        });

    },
    {
        threshold: 0.4
    }
);


counters.forEach(counter => {

    counterObserver.observe(counter);

});