const apiPath = "http://localhost:5000/api/users/";
const userTable = document.querySelector("#user-table-data");
const userForm = document.querySelector("#user-form");
const alert = document.querySelector("#alert");
const firstnameDetails = document.querySelector("#firstname-details");
const lastnameDetails = document.querySelector("#lastname-details");
const emailDetails = document.querySelector("#email-details");
const clearBtn = document.querySelector("#details-clear-btn");
const iconTypes = ["pen", "trash", "check", "rotate-left"];
let currentRow = null;

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
    showAlert(res.data.error, "error");
  } else {
    // Show success alert
    showAlert("User added successfully", "success");
    // Clear form
    inputs.forEach((input) => (input.value = ""));
    populateUserTable();
  }
}

async function handleTableClick(e) {
  let row, inputs, type, id;

  if (e.target.tagName === "I") {
    type = e.target.getAttribute("name");
    row = e.target.parentElement.parentElement;
    inputs = row.querySelectorAll("input");
    id = row.firstChild.textContent;
  }

  // Edit button click
  if (type === iconTypes[0]) {
    setCurrentRow(currentRow, row);
  }

  // Delete button click
  if (type === iconTypes[1]) {
    const res = await deleteUser(id);

    if (res.status !== 200) {
      showAlert(res.data.error, "error");
    }

    row.remove();
    showAlert(`User with email ${res.data.user.email} was deleted`, "success");
  }

  // Update button click
  if (type === iconTypes[2]) {
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
      populateUserTable();
    } else {
      showAlert(res.data.error, "error");
    }
  }

  // Cancel button click
  if (type === iconTypes[3]) {
    setCurrentRow(currentRow, null);
  }

  if (type === "info") {
    const res = await getUserById(id);

    if (res.status !== 200) {
      return showAlert(res.data.error, "error");
    }

    const { firstname, lastname, email } = res.data.user;
    firstnameDetails.innerText = firstname;
    lastnameDetails.innerText = lastname;
    emailDetails.innerText = email;
    clearBtn.classList.remove("hidden");
  }
}

function toggleIcons(icons) {
  icons.forEach((icon) => {
    if (icon.classList.contains("hidden")) {
      icon.classList.remove("hidden");
    } else {
      icon.classList.add("hidden");
    }
  });
}

function setCurrentRow(activeRow, newRow) {
  // If a row is currently in editable state, reset it.
  if (activeRow) {
    const inputs = activeRow.querySelectorAll("input");
    const icons = activeRow.querySelectorAll("td > i");
    inputs.forEach((input) => {
      input.value = input.defaultValue;
      input.setAttribute("readonly", true);
    });
    toggleIcons(icons);
  }
  // If there is a newRow to be edited, change it to editable state.
  if (newRow) {
    const inputs = newRow.querySelectorAll("input");
    const icons = newRow.querySelectorAll("td > i");
    console.log(icons);
    inputs.forEach((input, index) => {
      // Make inputs editable
      input.removeAttribute("readonly");
      // Highlight the current text in the first input field
      if (index === 0) {
        input.select();
      }
    });
    toggleIcons(icons);
  }
  // Set current row to the new row
  currentRow = newRow;
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

    // Create action icons
    iconTypes.forEach((type, index) => {
      // Only execute logic for first two items. The last two items are hidden buttons that belong in the same <td> element
      if (index > 1) return;
      const data = document.createElement("td");
      const icon = document.createElement("i");
      const hiddenIcon = document.createElement("i");
      icon.setAttribute("name", `${type}`);
      icon.classList.add(`fa-solid`, `fa-${type}`);
      hiddenIcon.setAttribute("name", `${iconTypes[index + 2]}`);
      hiddenIcon.classList.add(
        `fa-solid`,
        `fa-${iconTypes[index + 2]}`,
        `hidden`
      );
      data.appendChild(icon);
      data.appendChild(hiddenIcon);
      row.appendChild(data);
    });
    // Add info button
    const data = document.createElement("td");
    const icon = document.createElement("i");
    const iconType = "info";
    icon.setAttribute("name", iconType);
    icon.classList.add(`fa-solid`, `fa-${iconType}`, "text-center");
    icon.style.setProperty("display", "block", "important");
    data.appendChild(icon);
    row.appendChild(data);

    // Add the row to the table
    userTable.appendChild(row);
  });
}

/** API endpoint access functions */

async function getUsers() {
  const res = await fetch(apiPath);
  const data = await res.json();
  return {
    data: data,
    status: res.status,
  };
}

async function getUserById(id) {
  const res = await fetch(apiPath.concat(id));
  const data = await res.json();
  return {
    data: data,
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
    data: data,
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
    data: data,
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
