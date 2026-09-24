const projectsContainer =
    document.getElementById("projectsContainer");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

const welcomeText =
    document.getElementById("welcomeText");

const logoutButton =
    document.getElementById("logoutButton");


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function getStatusClass(status) {

    return status
        .toLowerCase()
        .replaceAll(" ", "-");
}


function renderProject(project) {

    const statusClass =
        getStatusClass(project.status);


    const previewButton =
        project.preview_url
            ? `
                <a
                    href="${escapeHTML(project.preview_url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary"
                >
                    View Website
                </a>
              `
            : `
                <span class="preview-unavailable">
                    Preview not available yet
                </span>
              `;


    return `

        <article class="project-card">

            <div class="project-card-header">

                <div>

                    <p class="project-code">
                        ${escapeHTML(project.project_code)}
                    </p>

                    <h2>
                        ${escapeHTML(project.website_name)}
                    </h2>

                </div>

                <span class="project-status ${statusClass}">
                    ${escapeHTML(project.status)}
                </span>

            </div>


            <p class="project-description">
                ${escapeHTML(project.description)}
            </p>


            <div class="project-progress">

                <div class="progress-label">

                    <span>
                        Progress
                    </span>

                    <strong>
                        ${project.progress || 0}%
                    </strong>

                </div>


                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="width:${project.progress || 0}%"
                    ></div>

                </div>

            </div>


            <div class="project-details">

                <div>
                    <span>Website Type</span>
                    <strong>
                        ${escapeHTML(project.website_type || "Not specified")}
                    </strong>
                </div>


                <div>
                    <span>Deadline</span>
                    <strong>
                        ${project.deadline
                            ? escapeHTML(project.deadline)
                            : "Not specified"}
                    </strong>
                </div>

            </div>


            <div class="project-actions">

                ${previewButton}

            </div>


            <div class="updates-section">

                <h3>
                    Project Updates
                </h3>

                <div
                    id="updates-${project.id}"
                    class="updates-list"
                >
                    Loading updates...
                </div>

            </div>

        </article>

    `;
}


async function loadUpdates(projectId) {

    const updatesContainer =
        document.getElementById(`updates-${projectId}`);


    const {
        data,
        error
    } = await supabaseClient
        .from("project_updates")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        updatesContainer.innerHTML =
            `<p class="muted">Unable to load updates.</p>`;

        return;
    }


    if (!data || data.length === 0) {

        updatesContainer.innerHTML =
            `<p class="muted">No updates yet.</p>`;

        return;
    }


    updatesContainer.innerHTML =
        data.map(update => `

            <div class="update-item">

                <div class="update-date">
                    ${new Date(update.created_at).toLocaleString()}
                </div>

                <h4>
                    ${escapeHTML(update.title)}
                </h4>

                <p>
                    ${escapeHTML(update.message)}
                </p>

            </div>

        `).join("");
}


async function loadDashboard() {

    try {

        const {
            data: {
                user
            },
            error: userError
        } = await supabaseClient.auth.getUser();


        if (userError || !user) {

            window.location.href =
                "login.html";

            return;
        }


        const {
            data: profile
        } = await supabaseClient
            .from("profiles")
            .select("full_name,email,role")
            .eq("id", user.id)
            .single();


        if (profile) {

            welcomeText.textContent =
                `Hi, ${profile.full_name || profile.email}`;

        }


        const {
            data: projects,
            error
        } = await supabaseClient
            .from("projects")
            .select("*")
            .eq("customer_id", user.id)
            .order("created_at", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        loading.style.display = "none";


        if (!projects || projects.length === 0) {

            emptyState.style.display =
                "block";

            return;
        }


        projectsContainer.innerHTML =
            projects.map(renderProject).join("");


        for (const project of projects) {

            await loadUpdates(project.id);

        }


    } catch (error) {

        console.error(error);

        loading.textContent =
            "Unable to load your dashboard.";

    }

}


logoutButton.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    window.location.href =
        "login.html";

});


loadDashboard();