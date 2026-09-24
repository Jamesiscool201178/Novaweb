const projectsContainer =
    document.getElementById("projectsContainer");


// ============================
// CHECK STAFF
// ============================

async function checkStaff() {

    const {
        data: sessionData,
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError) {
        throw sessionError;
    }

    if (!sessionData.session) {
        window.location.href = "login.html";
        return null;
    }

    const user = sessionData.session.user;

    const {
        data: profile,
        error
    } = await supabaseClient
        .from("profiles")
        .select("full_name,email,role")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!profile || profile.role !== "staff") {

        await supabaseClient.auth.signOut();

        window.location.href = "login.html";

        return null;
    }

    return {
        user,
        profile
    };
}


// ============================
// LOAD PROJECTS
// ============================

async function loadProjects() {

    try {

        const staff = await checkStaff();

        if (!staff) return;


        const {
            data: projects,
            error
        } = await supabaseClient
            .from("projects")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        updateStats(projects || []);

        renderProjects(projects || []);


    } catch (error) {

        console.error(error);

        projectsContainer.innerHTML = `
            <div class="error-card">
                <h3>Could not load projects</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;

    }
}


// ============================
// STATS
// ============================

function updateStats(projects) {

    document.getElementById("totalProjects").textContent =
        projects.length;

    document.getElementById("newProjects").textContent =
        projects.filter(
            p => p.status === "Request Received"
        ).length;

    document.getElementById("activeProjects").textContent =
        projects.filter(
            p =>
                p.status !== "Completed" &&
                p.status !== "Request Received"
        ).length;

    document.getElementById("completedProjects").textContent =
        projects.filter(
            p => p.status === "Completed"
        ).length;
}


// ============================
// RENDER
// ============================

function renderProjects(projects) {

    if (!projects.length) {

        projectsContainer.innerHTML = `
            <div class="empty-card">
                <div class="empty-icon">📋</div>
                <h3>No projects yet</h3>
                <p>
                    Customer website requests will appear here.
                </p>
            </div>
        `;

        return;
    }


    projectsContainer.innerHTML =
        projects
            .map(createProjectCard)
            .join("");
}


// ============================
// PROJECT CARD
// ============================

function createProjectCard(project) {

    const progress =
        Math.max(
            0,
            Math.min(
                100,
                Number(project.progress || 0)
            )
        );


    const claimed =
        project.claimed_by
            ? `
                <span class="claimed-badge">
                    ✓ Claimed
                </span>
              `
            : `
                <span class="unclaimed-badge">
                    Unclaimed
                </span>
              `;


    const statuses = [
        "Request Received",
        "Designing",
        "Development",
        "Customer Review",
        "Completed"
    ];


    return `

        <article class="admin-project-card">

            <div class="admin-project-header">

                <div>

                    <span class="project-code">
                        ${escapeHtml(project.project_code || "N/A")}
                    </span>

                    <h2>
                        ${escapeHtml(
                            project.website_name ||
                            "Website Project"
                        )}
                    </h2>

                </div>

                <div class="claim-status">
                    ${claimed}
                </div>

            </div>


            <!-- CUSTOMER -->

            <div class="customer-info">

                <h3>Customer</h3>

                <p>
                    <strong>Name:</strong>
                    ${escapeHtml(project.name || "Not provided")}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHtml(project.email || "Not provided")}
                </p>

                <p>
                    <strong>Discord:</strong>
                    ${escapeHtml(project.discord || "Not provided")}
                </p>

            </div>


            <!-- REQUEST -->

            <div class="request-info">

                <h3>Website Request</h3>

                <p>
                    ${escapeHtml(
                        project.description ||
                        "No description provided."
                    )}
                </p>

                <div class="request-details">

                    <span>
                        Type:
                        <strong>
                            ${escapeHtml(
                                project.website_type ||
                                "Not provided"
                            )}
                        </strong>
                    </span>

                    <span>
                        Pages:
                        <strong>
                            ${escapeHtml(
                                project.pages ||
                                "Not provided"
                            )}
                        </strong>
                    </span>

                    <span>
                        Deadline:
                        <strong>
                            ${escapeHtml(
                                project.deadline ||
                                "Not set"
                            )}
                        </strong>
                    </span>

                </div>

            </div>


            <!-- CLAIM -->

            <div class="admin-control">

                <label>Request Assignment</label>

                <button
                    class="claim-button"
                    onclick="claimProject('${project.id}')"
                    ${project.claimed_by ? "disabled" : ""}
                >

                    ${
                        project.claimed_by
                            ? "✓ Project Claimed"
                            : "Claim Project"
                    }

                </button>

            </div>


            <!-- STATUS -->

            <div class="admin-control">

                <label>
                    Project Status
                </label>

                <select
                    onchange="changeStatus(
                        '${project.id}',
                        this.value
                    )"
                >

                    ${statuses.map(status => `

                        <option
                            value="${escapeAttribute(status)}"
                            ${
                                project.status === status
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${status}
                        </option>

                    `).join("")}

                </select>

            </div>


            <!-- PROGRESS -->

            <div class="admin-control">

                <div class="progress-heading">

                    <label>
                        Progress
                    </label>

                    <strong>
                        ${progress}%
                    </strong>

                </div>

                <input
                    type="range"
                    min="0"
                    max="100"
                    value="${progress}"
                    oninput="updateProgressLabel(this)"
                    onchange="changeProgress(
                        '${project.id}',
                        this.value
                    )"
                >

            </div>


            <!-- ACTIONS -->

            <div class="admin-actions">

                <button
                    class="response-button"
                    onclick="toggleResponse('${project.id}')"
                >
                    ✉ Respond
                </button>

                <button
                    class="complete-button"
                    onclick="completeProject('${project.id}')"
                >
                    ✓ Mark Completed
                </button>

                <button
                    class="delete-button"
                    onclick="deleteProject('${project.id}')"
                >
                    Delete
                </button>

            </div>


            <!-- RESPONSE -->

            <div
                id="response-${project.id}"
                class="response-box"
                style="display:none;"
            >

                <input
                    id="response-title-${project.id}"
                    type="text"
                    placeholder="Update title"
                >

                <textarea
                    id="response-message-${project.id}"
                    rows="5"
                    placeholder="Write your message to the customer..."
                ></textarea>

                <button
                    onclick="sendResponse('${project.id}')"
                    class="send-response-button"
                >
                    Send Response
                </button>

            </div>


            <!-- PREVIEW -->

            ${
                project.preview_url
                    ? `
                        <a
                            href="${escapeAttribute(project.preview_url)}"
                            target="_blank"
                            class="admin-preview"
                        >
                            Open Website Preview →
                        </a>
                    `
                    : ""
            }

        </article>

    `;
}


// ============================
// CLAIM PROJECT
// ============================

async function claimProject(projectId) {

    try {

        const {
            data: sessionData
        } = await supabaseClient.auth.getSession();

        if (!sessionData.session) {
            window.location.href = "login.html";
            return;
        }

        const user =
            sessionData.session.user;


        const {
            error
        } = await supabaseClient
            .from("projects")
            .update({
                claimed_by: user.id,
                claimed_at: new Date().toISOString()
            })
            .eq("id", projectId)
            .is("claimed_by", null);


        if (error) {
            throw error;
        }


        await loadProjects();

    } catch (error) {

        alert(
            "Could not claim project:\n\n" +
            error.message
        );

    }
}


// ============================
// STATUS
// ============================

async function changeStatus(
    projectId,
    status
) {

    try {

        const progress =
            getProgressForStatus(status);


        const {
            error
        } = await supabaseClient
            .from("projects")
            .update({
                status: status,
                progress: progress
            })
            .eq("id", projectId);


        if (error) {
            throw error;
        }


        await loadProjects();

    } catch (error) {

        alert(
            "Could not update status:\n\n" +
            error.message
        );

    }
}


// ============================
// PROGRESS
// ============================

async function changeProgress(
    projectId,
    progress
) {

    try {

        const {
            error
        } = await supabaseClient
            .from("projects")
            .update({
                progress: Number(progress)
            })
            .eq("id", projectId);


        if (error) {
            throw error;
        }


        await loadProjects();

    } catch (error) {

        alert(
            "Could not update progress:\n\n" +
            error.message
        );

    }
}


function updateProgressLabel(input) {

    const strong =
        input.parentElement
            .querySelector("strong");

    if (strong) {
        strong.textContent =
            input.value + "%";
    }
}


function getProgressForStatus(status) {

    switch (status) {

        case "Request Received":
            return 0;

        case "Designing":
            return 25;

        case "Development":
            return 50;

        case "Customer Review":
            return 75;

        case "Completed":
            return 100;

        default:
            return 0;

    }
}


// ============================
// RESPONSE BOX
// ============================

function toggleResponse(projectId) {

    const box =
        document.getElementById(
            "response-" + projectId
        );

    box.style.display =
        box.style.display === "none"
            ? "block"
            : "none";
}


// ============================
// SEND RESPONSE
// ============================

async function sendResponse(projectId) {

    const title =
        document.getElementById(
            "response-title-" + projectId
        ).value.trim();

    const message =
        document.getElementById(
            "response-message-" + projectId
        ).value.trim();


    if (!message) {

        alert(
            "Please write a message first."
        );

        return;
    }


    try {

        const {
            data: project,
            error: projectError
        } = await supabaseClient
            .from("projects")
            .select("*")
            .eq("id", projectId)
            .single();


        if (projectError) {
            throw projectError;
        }


        // Save update to Supabase

        const {
            data: sessionData
        } = await supabaseClient.auth.getSession();

        const user =
            sessionData.session.user;


        const {
            error: updateError
        } = await supabaseClient
            .from("project_updates")
            .insert({

                project_id: projectId,

                title:
                    title ||
                    "NovaWeb Project Update",

                message: message,

                created_by: user.id

            });


        if (updateError) {
            throw updateError;
        }


        // Send customer email

        const {
            error: emailError
        } = await supabaseClient.functions.invoke(
            "send-customer-response",
            {
                body: {

                    customerEmail:
                        project.email,

                    customerName:
                        project.name,

                    websiteName:
                        project.website_name,

                    title:
                        title ||
                        "NovaWeb Project Update",

                    message:
                        message

                }
            }
        );


        if (emailError) {

            alert(
                "The update was saved, but the email could not be sent.\n\n" +
                emailError.message
            );

            await loadProjects();

            return;
        }


        alert(
            "Response sent successfully!"
        );


        await loadProjects();


    } catch (error) {

        alert(
            "Could not send response:\n\n" +
            error.message
        );

    }
}


// ============================
// COMPLETE
// ============================

async function completeProject(projectId) {

    const confirmed =
        confirm(
            "Mark this project as completed?"
        );


    if (!confirmed) return;


    try {

        const {
            error
        } = await supabaseClient
            .from("projects")
            .update({

                status: "Completed",

                progress: 100

            })
            .eq("id", projectId);


        if (error) {
            throw error;
        }


        await loadProjects();

    } catch (error) {

        alert(
            "Could not complete project:\n\n" +
            error.message
        );

    }
}


// ============================
// DELETE
// ============================

async function deleteProject(projectId) {

    const confirmed =
        confirm(
            "Delete this project permanently?\n\nThis cannot be undone."
        );


    if (!confirmed) return;


    try {

        const {
            error
        } = await supabaseClient
            .from("projects")
            .delete()
            .eq("id", projectId);


        if (error) {
            throw error;
        }


        await loadProjects();

    } catch (error) {

        alert(
            "Could not delete project:\n\n" +
            error.message
        );

    }
}


// ============================
// LOGOUT
// ============================

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

        }
    );


// ============================
// REFRESH
// ============================

document
    .getElementById("refreshButton")
    .addEventListener(
        "click",
        loadProjects
    );


// ============================
// HELPERS
// ============================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHtml(value);

}


// START

loadProjects();