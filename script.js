document.addEventListener("DOMContentLoaded", () => {

    async function updateClientLogin() {
        const clientLogin = document.getElementById("clientLogin");
        if (!clientLogin) return;

        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
            console.error(error);
            return;
        }

        if (data.session) {
            clientLogin.style.display = "none";
        } else {
            clientLogin.style.display = "inline-block";
        }
    }


    async function checkWebsiteStatus() {
        const statusText = document.getElementById("statusText");
        const statusDot = document.getElementById("statusDot");

        if (!statusText) return;

        try {
            const response = await fetch(window.location.href, {
                method: "HEAD",
                cache: "no-store"
            });

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

        } catch {
            statusText.textContent = "Offline";

            if (statusDot) {
                statusDot.classList.remove("online");
            }
        }
    }


    const requestForm = document.getElementById("requestForm");

    if (requestForm) {

        requestForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const submitButton =
                requestForm.querySelector("button[type='submit']");

            try {

                const {
                    data: sessionData,
                    error: sessionError
                } = await supabaseClient.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                if (!sessionData.session) {

                    alert("Please log in before submitting a website request.");

                    window.location.href = "login.html";

                    return;
                }


                const user = sessionData.session.user;


                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = "Checking account...";
                }


                /*
                 * MAKE SURE THE USER HAS A PROFILE
                 */

                const {
                    data: profile,
                    error: profileError
                } = await supabaseClient
                    .from("profiles")
                    .select("id")
                    .eq("id", user.id)
                    .maybeSingle();


                if (profileError) {
                    console.error("Profile lookup error:", profileError);

                    throw new Error(
                        "Could not check your customer profile: " +
                        profileError.message
                    );
                }


                /*
                 * CREATE PROFILE IF IT DOESN'T EXIST
                 */

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


                /*
                 * COLLECT FORM DATA
                 */

                if (submitButton) {
                    submitButton.textContent = "Submitting...";
                }


                const getValue = (id) => {

                    const element = document.getElementById(id);

                    return element
                        ? element.value.trim()
                        : "";
                };


                const projectName = getValue("websiteName");
                const websiteType = getValue("websiteType");
                const description = getValue("description");
                const pages = getValue("pages");
                const features = getValue("features");
                const deadline = getValue("deadline");
                const examples = getValue("examples");
                const extra = getValue("extra");
                const name = getValue("name");
                const discord = getValue("discord");
                const email = getValue("email");


                if (!name || !email || !projectName || !description) {

                    throw new Error(
                        "Please complete all required fields."
                    );
                }


                /*
                 * CREATE PROJECT
                 */

                const {
                    data: project,
                    error: projectError
                } = await supabaseClient
                    .from("projects")
                    .insert({

                        project_code:
                            "NW-" +
                            crypto
                                .randomUUID()
                                .substring(0, 8)
                                .toUpperCase(),

                        customer_id: user.id,

                        name: name,
                        discord: discord,
                        email: email,

                        website_name: projectName,
                        website_type: websiteType,

                        description: description,
                        pages: pages,
                        features: features,

                        deadline: deadline || null,

                        examples: examples,
                        extra: extra,

                        status: "Request Received",
                        progress: 0

                    })
                    .select()
                    .single();


                if (projectError) {

                    console.error(
                        "PROJECT ERROR:",
                        projectError
                    );

                    throw new Error(
                        projectError.message
                    );
                }


                console.log("Project created:", project);


                alert(
                    "Your website request has been submitted successfully!"
                );


                window.location.href = "dashboard.html";


            } catch (error) {

                console.error(
                    "Request submission error:",
                    error
                );


                alert(
                    "Something went wrong:\n\n" +
                    error.message
                );


                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Submit Request";
                }
            }
        });
    }


    updateClientLogin();

    checkWebsiteStatus();

    setInterval(checkWebsiteStatus, 60000);

});