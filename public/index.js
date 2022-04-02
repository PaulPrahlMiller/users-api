const userTable = document.querySelector("#user-table-data");
const userForm = document.querySelector("#user-form");
const alert = document.querySelector("#alert");
const firstnameDetails = document.querySelector("#firstname-details");
const lastnameDetails = document.querySelector("#lastname-details");
const emailDetails = document.querySelector("#email-details");
const clearBtn = document.querySelector("#details-clear-btn");

document.addEventListener("DOMContentLoaded", populateUserTable);
userTable.addEventListener("click", (e) => handleTableClick(e));
userForm.addEventListener("submit", (e) => handleFormSubmit(e));
clearBtn.addEventListener("click", (e) => clearDetails(e));

async function handleFormSubmit(e) {
  e.preventDefault();

  const inputs = userForm.querySelectorAll(
    "input[type='text'], input[type='email']"
  );

  const user = {
    firstname: inputs[0].value,
    lastname: inputs[1].value,
    email: inputs[2].value,
  };

  const res = await addUser(user);

  if (res.status !== 201) {
    // Show error alert
    showAlert(res.error, "error");
  } else {
    // Show success alert
    showAlert("User added successfully", "success");
    // Clear form
    inputs.forEach((input) => (input.value = ""));
    populateUserTable();
  }
}

async function handleTableClick(e) {
  let row, buttons, inputs, type, id;

  if (e.target.tagName === "BUTTON") {
    type = e.target.getAttribute("name");
    row = e.target.parentElement.parentElement;
    buttons = row.querySelectorAll("td > button");
    inputs = row.querySelectorAll("input");
    id = row.firstChild.textContent;
  }

  if (type === "delete") {
    const res = await deleteUser(id);

    if (res.status !== 200) {
      showAlert(res.error, "error");
    }

    row.remove();
    showAlert(`User ${res.data.user.email} deleted`, "success");
    toggleButtons(buttons);
  }

  if (type === "edit") {
    // Change action buttons
    toggleButtons(buttons);

    // Make inputs editable
    inputs.forEach((input, index) => {
      input.removeAttribute("readonly");
    });
  }

  if (type === "update") {
    let fieldsToUpdate = {};

    // Validate the inputs
    let valid = true;

    inputs.forEach((input) => {
      if (!input.reportValidity()) {
        valid = false;
      }
      if (input.value !== input.defaultValue) {
        fieldsToUpdate[input.getAttribute("name")] = input.value;
      }
    });

    // Exit function if inputs are invalid or there are no changed fields
    if (!valid || Object.keys(fieldsToUpdate).length === 0) return;

    const res = await updateUser(fieldsToUpdate, id);

    if (res.status === 200) {
      showAlert("User updated", "success");
      toggleButtons(buttons);
      populateUserTable();
    } else {
      showAlert(res.error, "error");
    }
  }

  if (type === "cancel") {
    inputs.forEach((input) => {
      input.value = input.defaultValue;
      input.setAttribute("readonly", true);
    });
    toggleButtons(buttons);
  }

  if (type === "select") {
    const res = await getUserById(id);

    if (res.status !== 200) {
      return; //Show error
    }

    const { firstname, lastname, email } = res.data.user;
    firstnameDetails.innerText = firstname;
    lastnameDetails.innerText = lastname;
    emailDetails.innerText = email;
    clearBtn.classList.remove("hidden");
  }
}

function toggleButtons(buttons) {
  buttons.forEach((button) => {
    if (button.classList.contains("hidden")) {
      button.classList.remove("hidden");
    } else {
      button.classList.add("hidden");
    }
  });
}

async function populateUserTable() {
  const res = await getUsers();

  if (res.status !== 200) {
    return showAlert(res.error, "error");
  }

  const users = res.data.users;

  // Clear the users table if it contains data
  userTable.innerHTML = "";

  // Create a table row for each user
  users.forEach((user) => {
    const { _id, firstname, lastname, email } = user;
    const editableFields = { firstname, lastname, email };
    const buttonTypes = ["edit", "delete", "update", "cancel"];
    const row = document.createElement("tr");

    // Create user id field
    const id = document.createElement("td");
    id.innerText = _id;
    row.appendChild(id);

    // Create editable input fields (firstname, lastname, email)
    Object.keys(editableFields).forEach((key) => {
      // Generic logic for both input types
      const tableData = document.createElement("td");
      const input = document.createElement("input");
      input.setAttribute("readonly", true);
      input.setAttribute("required", true);
      input.setAttribute("defaultValue", `${editableFields[key]}`);
      input.setAttribute("value", `${editableFields[key]}`);
      input.setAttribute("name", key);

      // Unique logic for email input
      if (key === "email") {
        input.setAttribute("type", "email");
        input.setAttribute("maxLength", "255");
        tableData.appendChild(input);
        row.appendChild(tableData);
        return;
      }

      // Unique logic for text inputs
      input.setAttribute("type", "text");
      input.setAttribute("minLength", "2");
      input.setAttribute("maxLength", "32");
      tableData.appendChild(input);
      row.appendChild(tableData);
    });

    // Create action buttons
    buttonTypes.forEach((type, index) => {
      // Only execute logic for first two items. The last two items are hidden buttons that belong in the same <td> element
      if (index > 1) return;
      const data = document.createElement("td");
      const button = document.createElement("button");
      const hiddenButton = document.createElement("button");
      button.setAttribute("name", `${type}`);
      button.innerText = `${type}`;
      button.classList.add(`btn-${type}`);
      hiddenButton.setAttribute("name", `${buttonTypes[index + 2]}`);
      hiddenButton.innerText = `${buttonTypes[index + 2]}`;
      hiddenButton.classList.add(`btn-${buttonTypes[index + 2]}`);
      hiddenButton.classList.add(`hidden`);
      data.appendChild(button);
      data.appendChild(hiddenButton);
      row.appendChild(data);
    });
    // Add select button
    const data = document.createElement("td");
    const button = document.createElement("button");
    button.setAttribute("name", "select");
    button.innerText = "select";
    button.classList.add("btn-select");
    button.style.setProperty("display", "block", "important");
    data.appendChild(button);
    row.appendChild(data);
    // Add the row to the table
    userTable.appendChild(row);
  });
}

function clearDetails(e) {
  clearBtn.classList.add("hidden");
  firstnameDetails.innerText = "";
  lastnameDetails.innerText = "";
  emailDetails.innerText = "";
}

function showAlert(msg, type) {
  alert.innerText = msg;
  alert.classList.add(`alert-${type}`);
  setTimeout(() => {
    alert.innerText = "";
    alert.classList.remove(`alert-${type}`);
  }, 3000);
}

const apiPath = "http://localhost:5000/api/users/";

async function getUsers() {
  const res = await fetch(apiPath);
  const data = await res.json();
  return {
    data,
    status: res.status,
  };
}

async function getUserById(id) {
  const res = await fetch(apiPath.concat(id));
  const data = await res.json();
  return {
    data,
    status: res.status,
  };
}

async function addUser(user) {
  const res = await fetch(apiPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const data = await res.json();
  return {
    data,
    status: res.status,
  };
}

async function updateUser(fields, id) {
  const res = await fetch(apiPath.concat(id), {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(fields),
  });
  const data = await res.json();
  return {
    data,
    status: res.status,
  };
}

async function deleteUser(id) {
  const res = await fetch(apiPath.concat(id), {
    method: "DELETE",
  });
  const data = await res.json();
  return {
    data: data,
    status: res.status,
  };
}
