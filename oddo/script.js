// LocalStorage data
let users = JSON.parse(localStorage.getItem("users")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let company = JSON.parse(localStorage.getItem("company")) || null;
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// Signup
function signup() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const pass = document.getElementById("signupPass").value;
  const country = document.getElementById("signupCountry").value;

  if (!name || !email || !pass) {
    alert("All fields required!");
    return;
  }

  if (users.find((u) => u.email === email)) {
    alert("User already exists!");
    return;
  }

  // First signup → Admin + Company auto-create
  if (!company) {
    company = {
      name: "MyCompany",
      currency: country,
    };
    localStorage.setItem("company", JSON.stringify(company));
    const admin = { name, email, pass, role: "admin", manager: null };
    users.push(admin);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Company + Admin created!");
  } else {
    const emp = { name, email, pass, role: "employee", manager: null };
    users.push(emp);
    localStorage.setItem("users", JSON.stringify(users));
    alert("User created, login now!");
  }
}

// Login
function login() {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;

  const user = users.find((u) => u.email === email && u.pass === pass);
  if (!user) {
    alert("Invalid credentials");
    return;
  }
  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "dashboard.html";
}

// Logout
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// Dashboard Init
if (window.location.pathname.includes("dashboard.html")) {
  if (!currentUser) window.location.href = "index.html";
  document.getElementById("userName").innerText = currentUser.name;
  document.getElementById("userRole").innerText = currentUser.role;
  document.getElementById("companyName").innerText = company?.name;
  document.getElementById("companyCurrency").innerText = company?.currency;

  renderPanels();
}

// Render Panels
function renderPanels() {
  // Admin Panel
  if (currentUser.role === "admin") {
    document.getElementById("adminPanel").innerHTML = `
      <h3>Admin Panel</h3>
      <h4>Create User</h4>
      <input id="newName" placeholder="Name">
      <input id="newEmail" placeholder="Email">
      <input id="newPass" placeholder="Password">
      <select id="newRole">
        <option value="employee">Employee</option>
        <option value="manager">Manager</option>
      </select>
      <button onclick="createUser()">Create User</button>

      <h4>All Users</h4>
      <ul>${users.map(u => `<li>${u.name} (${u.role})
        <button onclick="setRole('${u.email}','employee')">Set Employee</button>
        <button onclick="setRole('${u.email}','manager')">Set Manager</button>
        <button onclick="setRole('${u.email}','admin')">Set Admin</button>
      </li>`).join("")}</ul>

      <h4>All Expenses</h4>
      <ul>${transactions.map(t => `<li>${t.text} (${t.amount}) by ${t.user} - <b>${t.status}</b>
        <button onclick="overrideApprove(${t.id})">Force Approve</button>
        <button onclick="overrideReject(${t.id})">Force Reject</button>
      </li>`).join("")}</ul>
    `;
  }

  // Manager Panel
  if (currentUser.role === "manager") {
    document.getElementById("managerPanel").innerHTML = `
      <h3>Manager Panel</h3>
      <ul>${transactions.filter(t => t.status==="Pending").map(t =>
        `<li>${t.text} (${t.amount}) by ${t.user} - <b>${t.status}</b>
        <button onclick="approve(${t.id})">Approve</button>
        <button onclick="reject(${t.id})">Reject</button></li>`
      ).join("")}</ul>
    `;
  }

  // Employee Panel
  if (currentUser.role === "employee") {
    document.getElementById("employeePanel").innerHTML = `
      <h3>Add Expense</h3>
      <input id="text" placeholder="Description">
      <input id="amount" placeholder="Amount" type="number">
      <button onclick="addExpense()">Submit</button>

      <h4>My Expenses</h4>
      <ul>${transactions.filter(t=>t.user===currentUser.email).map(t =>
        `<li>${t.text} (${t.amount}) - <b>${t.status}</b></li>`).join("")}</ul>
    `;
  }
}

// Admin Create User
function createUser() {
  const name = document.getElementById("newName").value;
  const email = document.getElementById("newEmail").value;
  const pass = document.getElementById("newPass").value;
  const role = document.getElementById("newRole").value;
  users.push({ name, email, pass, role, manager: null });
  localStorage.setItem("users", JSON.stringify(users));
  renderPanels();
}

// Set Role
function setRole(email, role) {
  users = users.map(u => u.email === email ? {...u, role} : u);
  localStorage.setItem("users", JSON.stringify(users));
  renderPanels();
}

// Employee Add Expense
function addExpense() {
  const text = document.getElementById("text").value;
  const amount = +document.getElementById("amount").value;
  transactions.push({ id: Date.now(), text, amount, user: currentUser.email, status: "Pending" });
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderPanels();
}

// Approvals
function approve(id) {
  transactions = transactions.map(t => t.id===id ? {...t,status:"Approved"} : t);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderPanels();
}

function reject(id) {
  transactions = transactions.map(t => t.id===id ? {...t,status:"Rejected"} : t);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderPanels();
}

// Admin Override
function overrideApprove(id) {
  transactions = transactions.map(t => t.id===id ? {...t,status:"Force Approved"} : t);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderPanels();
}

function overrideReject(id) {
  transactions = transactions.map(t => t.id===id ? {...t,status:"Force Rejected"} : t);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderPanels();
}
