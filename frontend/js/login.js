// Load users from localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;

// Login form
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    loggedInUser = user;
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = " ./pages/bond-setup.html";
  } else {
    alert("Invalid email or password");
  }
});
