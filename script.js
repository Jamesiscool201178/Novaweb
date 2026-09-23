const form = document.getElementById("projectForm");
const modal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");
const requestNumber = document.getElementById("requestNumber");

/*
Generate a random project/ticket number.
*/
function generateTicketNumber() {
const number = Math.floor(1000 + Math.random() * 9000);
return `#NW-${number}`;
}

/*
Handle project form submission.
*/
form.addEventListener("submit", function (event) {

```
event.preventDefault();

const ticket = generateTicketNumber();

requestNumber.textContent = ticket;

modal.classList.add("show");

/*
    Save the request locally.

    IMPORTANT:
    This stores the request in the visitor's browser only.
    It does NOT send the request to you yet.

    Later, you can connect this form to:
    - Discord
    - Email
    - Firebase
    - Supabase
    - Your own database
    - A real admin dashboard
*/

const formData = new FormData(form);

const project = {
    ticket: ticket,
    name: formData.get("name"),
    discord: formData.get("discord"),
    email: formData.get("email"),
    websiteName: formData.get("websiteName"),
    websiteType: formData.get("websiteType"),
    description: formData.get("description"),
    pages: formData.get("pages"),
    features: formData.get("features"),
    budget: formData.get("budget"),
    deadline: formData.get("deadline"),
    examples: formData.get("examples"),
    extra: formData.get("extra"),
    createdAt: new Date().toISOString()
};


/*
    Get previous requests.
*/
let requests = JSON.parse(
    localStorage.getItem("websiteRequests")
) || [];


/*
    Add the new request.
*/
requests.push(project);


/*
    Save requests.
*/
localStorage.setItem(
    "websiteRequests",
    JSON.stringify(requests)
);


/*
    Reset form.
*/
form.reset();
```

});

/*
Close success modal.
*/
closeModal.addEventListener("click", function () {

```
modal.classList.remove("show");

document.getElementById("request").scrollIntoView({
    behavior: "smooth"
});
```

});

/*
Close modal if the user clicks the background.
*/
modal.addEventListener("click", function (event) {

```
if (event.target === modal) {
    modal.classList.remove("show");
}
```

});

/*
Set minimum deadline to today.
*/
const deadlineInput = document.getElementById("deadline");

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

deadlineInput.min = `${year}-${month}-${day}`;
