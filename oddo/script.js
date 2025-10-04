// User & Transactions Storage
let users = JSON.parse(localStorage.getItem("users")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// Signup
function signup() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const pass = document.getElementById("signupPass").value;
  const role = document.getElementById("signupRole").value;

  if (!name || !email || !pass) {
    alert("All fields required!");
    return;
  }

  if (users.find((u) => u.email === email)) {
    alert("User already exists!");
    return;
  }

  const user = { name, email, pass, role };
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Signup successful! Please login.");
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
  if (!currentUser) {
    window.location.href = "index.html";
  } else {
    document.getElementById("userName").innerText = currentUser.name;
    document.getElementById("userRole").innerText = currentUser.role;

    renderTransactions();

    document.getElementById("form").addEventListener("submit", addTransaction);
  }
}

// Add Transaction
function addTransaction(e) {
  e.preventDefault();
  const text = document.getElementById("text").value;
  const amount = document.getElementById("amount").value;

  if (!text || !amount) {
    alert("Enter text and amount!");
    return;
  }

  const transaction = {
    id: Date.now(),
    text,
    amount: +amount,
    user: currentUser.email,
    status: "Pending" // default
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  document.getElementById("form").reset();
}

// Render Transactions
function renderTransactions() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  transactions.forEach((t) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${t.text} (${t.amount}) - 
      <strong>${t.status}</strong>
      ${currentUser.role === "manager" && t.status === "Pending"
        ? `<button onclick="approve(${t.id})">Approve</button>`
        : ""}
    `;
    list.appendChild(li);
  });
}

// Approve Transaction
function approve(id) {
  transactions = transactions.map((t) =>
    t.id === id ? { ...t, status: "Approved" } : t
  );
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
}
