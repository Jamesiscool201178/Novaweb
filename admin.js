const projectList =
    document.getElementById("projectList");

const editor =
    document.getElementById("editor");

const noProject =
    document.getElementById("noProject");

const editorCode =
    document.getElementById("editorCode");

const editorName =
    document.getElementById("editorName");

const statusSelect =
    document.getElementById("statusSelect");

const progressInput =
    document.getElementById("progressInput");

const previewInput =
    document.getElementById("previewInput");

const saveProject =
    document.getElementById("saveProject");

const publishUpdate =
    document.getElementById("publishUpdate");

const updateTitle =
    document.getElementById("updateTitle");

const updateMessage =
    document.getElementById("updateMessage");

const adminMessage =
    document.getElementById("adminMessage");

const logoutButton =
    document.getElementById("logoutButton");

const refreshProjects =
    document.getElementById("refreshProjects");


let projects = [];

let selectedProject = null;


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


async function checkStaff() {

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        window.location.href =
            "login.html";

        return false;
    }


    const {
        data: profile,
        error
    } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();


    if (error || !profile || profile.role !== "staff") {

        alert("You do not have staff access.");

        window.location.href =
            "dashboard.html";

        return false;
    }


    return true;
}


async function loadProjects() {

    projectList.innerHTML =
        "Loading projects...";


    const {
        data,
        error
    } = await supabaseClient
        .from("projects")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        projectList.innerHTML =
            "Unable to load projects.";

        return;
    }


    projects = data || [];


    if (projects.length === 0) {

        projectList.innerHTML =
            "No projects found.";

        return;
    }


    projectList.innerHTML =
        projects.map(project => `

            <button
                class="admin-project-item"
                data-id="${project.id}"
            >

                <span class="admin-project-code">
                    ${escapeHTML(project.project_code)}
                </span>

                <strong>
                    ${escapeHTML(project.website_name)}
                </strong>

                <span>
                    ${escapeHTML(project.status)}
                </span>

            </button>

        `).join("");


    document
        .querySelectorAll(".admin-project-item")
        .forEach(button => {

            button.addEventListener("click", () => {

                selectProject(button.dataset.id);

            });

        });


    if (selectedProject) {

        const exists =
            projects.find(
                project => project.id === selectedProject.id
            );

        if (exists) {
            selectProject(exists.id);
        }

    }

}


function selectProject(id) {

    selectedProject =
        projects.find(
            project => project.id === id
        );


    if (!selectedProject) {
        return;
    }


    noProject.style.display =
        "none";

    editor.style.display =
        "block";


    editorCode.textContent =
        selectedProject.project_code;

    editorName.textContent =
        selectedProject.website_name;


    statusSelect.value =
        selectedProject.status || "Request Received";


    progressInput.value =
        selectedProject.progress || 0;


    previewInput.value =
        selectedProject.preview_url || "";


    updateTitle.value = "";

    updateMessage.value = "";

    adminMessage.textContent = "";


    document
        .querySelectorAll(".admin-project-item")
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.id === id
            );

        });

}


saveProject.addEventListener("click", async () => {

    if (!selectedProject) {
        return;
    }


    saveProject.disabled = true;

    saveProject.textContent =
        "Saving...";


    adminMessage.textContent = "";


    try {

        let progress =
            Number(progressInput.value);


        progress =
            Math.max(
                0,
                Math.min(
                    100,
                    progress
                )
            );


        const {
            error
        } = await supabaseClient
            .from("projects")
            .update({

                status:
                    statusSelect.value,

                progress,

                preview_url:
                    previewInput.value.trim() || null

            })
            .eq("id", selectedProject.id);


        if (error) {
            throw error;
        }


        selectedProject.status =
            statusSelect.value;

        selectedProject.progress =
            progress;

        selectedProject.preview_url =
            previewInput.value.trim() || null;


        adminMessage.textContent =
            "Project saved successfully.";

        adminMessage.className =
            "form-message success";


        await loadProjects();


    } catch (error) {

        console.error(error);

        adminMessage.textContent =
            error.message ||
            "Unable to save project.";

        adminMessage.className =
            "form-message error";

    } finally {

        saveProject.disabled = false;

        saveProject.textContent =
            "Save Project";

    }

});


publishUpdate.addEventListener("click", async () => {

    if (!selectedProject) {
        return;
    }


    const title =
        updateTitle.value.trim();

    const message =
        updateMessage.value.trim();


    if (!title || !message) {

        adminMessage.textContent =
            "Please enter both a title and message.";

        adminMessage.className =
            "form-message error";

        return;
    }


    publishUpdate.disabled = true;

    publishUpdate.textContent =
        "Publishing...";


    try {

        const {
            data: {
                user
            }
        } = await supabaseClient.auth.getUser();


        const {
            error
        } = await supabaseClient
            .from("project_updates")
            .insert({

                project_id:
                    selectedProject.id,

                title,

                message,

                created_by:
                    user.id

            });


        if (error) {
            throw error;
        }


        updateTitle.value = "";

        updateMessage.value = "";


        adminMessage.textContent =
            "Update published successfully.";

        adminMessage.className =
            "form-message success";


    } catch (error) {

        console.error(error);

        adminMessage.textContent =
            error.message ||
            "Unable to publish update.";

        adminMessage.className =
            "form-message error";

    } finally {

        publishUpdate.disabled = false;

        publishUpdate.textContent =
            "Publish Update";

    }

});


refreshProjects.addEventListener(
    "click",
    loadProjects
);


logoutButton.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        window.location.href =
            "login.html";

    }
);


async function startAdmin() {

    const allowed =
        await checkStaff();


    if (!allowed) {
        return;
    }


    await loadProjects();

}


startAdmin();