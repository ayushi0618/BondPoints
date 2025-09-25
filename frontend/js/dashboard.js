const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const bondData = JSON.parse(localStorage.getItem("bondData"));
if (!loggedInUser) window.location.href = " ../index.html";

let users = JSON.parse(localStorage.getItem("users")) || [];
let userPoints = loggedInUser.points;
let partnerPoints = loggedInUser.partnerPoints;
let history = loggedInUser.history || [];

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "../index.html";
});

// Update points
function updatePoints() {
  document.getElementById("userPoints").textContent = userPoints;
  document.getElementById("partnerPoints").textContent = partnerPoints;
  updateBondLevel();
}

// Update bond level
function updateBondLevel() {
  const totalPoints = userPoints + partnerPoints;
  const maxPoints = 1000;
  let level = Math.floor((totalPoints / maxPoints) * 10);
  if (level < 1) level = 1;
  if (level > 10) level = 10;
  document.getElementById("bondLevel").textContent = level;
  document.getElementById("userProgress").style.width = Math.min((userPoints / 500) * 100, 100) + "%";
  document.getElementById("partnerProgress").style.width = Math.min((partnerPoints / 500) * 100, 100) + "%";
}

// History
const historyBox = document.getElementById("history");
function addHistory(message) {
  const entry = document.createElement("div");
  entry.classList.add("list-item");
  entry.textContent = message;
  historyBox.prepend(entry);
  history.unshift(message);
  saveData();
}

function saveData() {
  users = users.map(u =>
    u.email === loggedInUser.email ? { ...u, points: userPoints, partnerPoints, history } : u
  );
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("loggedInUser", JSON.stringify({ ...loggedInUser, points: userPoints, partnerPoints, history }));
}

// Interaction form
document.getElementById("interactionForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const incident = document.getElementById("incident").value;
  const person = document.getElementById("person").value;
  const damage = document.getElementById("damage").value;

  let deduction = 10;
  if (damage === "mental") deduction = 15;
  if (damage === "trust") deduction = 20;
  if (damage === "time") deduction = 5;

  if (person === "you") userPoints -= deduction;
  else partnerPoints -= deduction;

  addHistory(`${person === "you" ? "You" : "Partner"} lost ${deduction} pts due to ${damage} damage (${incident}).`);
  updatePoints();
});

// Initialize
updatePoints();

// Display bond info
const bondInfo = document.getElementById("bondInfo");
if (bondData) {
  bondInfo.innerHTML = `
    <h3>Current Bond</h3>
    <p><strong>${bondData.userName}</strong> & <strong>${bondData.partnerName}</strong></p>
    <p>Type: <strong>${bondData.bondType}</strong></p>
    <p>Duration: <strong>${bondData.startDate}</strong> to <strong>${bondData.endDate}</strong></p>
  `;
} else {
  bondInfo.innerHTML = "<p>No active bond.</p>";
}
