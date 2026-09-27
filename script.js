document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       NOVAWEB — CLIENT LOGIN BUTTON
    ========================================= */

    const clientLogin = document.getElementById("clientLogin");

    if (clientLogin) {
        clientLogin.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }


    /* =========================================
       NOVAWEB — WEBSITE STATUS
    ========================================= */

    async function checkWebsiteStatus() {

        const statusText = document.getElementById("statusText");
        const statusDot = document.getElementById("statusDot");

        if (!statusText || !statusDot) {
            return;
        }

        statusText.textContent = "Checking...";
        statusDot.classList.remove("online", "offline");

        try {

            const controller = new AbortController();

            const timeout = setTimeout(() => {
                controller.abort();
            }, 8000);

            const response = await fetch(window.location.href, {
                method: "GET",
                cache: "no-store",
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (response.ok) {

                statusText.textContent = "Online";

                statusDot.classList.add("online");
                statusDot.classList.remove("offline");

            } else {

                statusText.textContent = "Offline";

                statusDot.classList.add("offline");
                statusDot.classList.remove("online");

            }

        } catch (error) {

            console.error("NovaWeb status check failed:", error);

            statusText.textContent = "Offline";

            statusDot.classList.add("offline");
            statusDot.classList.remove("online");
        }
    }


    /* =========================================
       NOVAWEB — WEBSITE REQUEST FORM
    ========================================= */

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

                if (submitButton) {

                    submitButton.disabled = true;
                    submitButton.textContent = "Checking account...";

                }

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

                const projectCode =
                    "NW-" +
                    crypto
                        .randomUUID()
                        .substring(0, 8)
                        .toUpperCase();

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

                    throw new Error(
                        projectError.message
                    );

                }

                alert(
                    "Your website request has been submitted successfully!\n\n" +
                    "Project ID: " +
                    projectCode +
                    "\n\n" +
                    "You can now track your project from your dashboard."
                );

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


    /* =========================================
       NOVAWEB — PORTFOLIO
    ========================================= */

    const portfolioGrid =
        document.getElementById("portfolioGrid");

    if (portfolioGrid) {

        const projects = [

            {
                title: "Nova Studio",
                category: "Gaming / Studio Website",
                description:
                    "A custom website created for Nova Studio, showcasing the studio and its projects with a modern gaming-focused design.",
                image:
                    "https://jamesiscool201178.github.io/Nova-Studio/",
                link:
                    "https://jamesiscool201178.github.io/Nova-Studio/"
            },

            {
                title: "NovaWeb",
                category: "Web Development Platform",
                description:
                    "The official NovaWeb website, built to showcase our services, portfolio and website request system.",
                image:
                    "https://jamesiscool201178.github.io/Novaweb/",
                link:
                    "https://jamesiscool201178.github.io/Novaweb/"
            },

            {
                title: "Dovedale Railway",
                category: "Railway Community",
                description:
                    "A community-focused website for Dovedale Railway, featuring information about the railway and its different roles.",
                image:
                    "https://via.placeholder.com/900x550/07152f/ffffff?text=Dovedale+Railway",
                link:
                    "https://discord.gg/dovedale"
            },

            {
                title: "Netball Website",
                category: "Sports Website",
                description:
                    "A modern sports website designed around a netball community.",
                image:
                    "https://via.placeholder.com/900x550/07152f/ffffff?text=Netball+Website",
                link:
                    "#"
            },

            {
                title: "Ticket System",
                category: "Support Platform",
                description:
                    "A web-based ticket system designed for handling customer support requests.",
                image:
                    "https://via.placeholder.com/900x550/07152f/ffffff?text=Ticket+System",
                link:
                    "https://ticket-system-oxwq.onrender.com/"
            }

        ];


        portfolioGrid.innerHTML = projects.map(project => {

            return `
                <article class="portfolio-card">

                    <div class="portfolio-image">

                        <iframe
                            src="${project.image}"
                            title="${project.title}"
                            loading="lazy"
                            sandbox="allow-scripts allow-same-origin"
                        ></iframe>

                    </div>

                    <div class="portfolio-content">

                        <span class="portfolio-category">
                            ${project.category}
                        </span>

                        <h3>
                            ${project.title}
                        </h3>

                        <p>
                            ${project.description}
                        </p>

                        <a
                            href="${project.link}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="portfolio-button"
                        >
                            View Website →
                        </a>

                    </div>

                </article>
            `;

        }).join("");

    }


    /* =========================================
       START WEBSITE STATUS CHECK
    ========================================= */

    checkWebsiteStatus();

    setInterval(
        checkWebsiteStatus,
        60000
    );

});