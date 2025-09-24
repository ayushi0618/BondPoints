/* =============================
   GLOBAL VARIABLES
   ============================= */
let users = JSON.parse(localStorage.getItem("users")) || [];
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
let bondData = JSON.parse(localStorage.getItem("bondData")) || null;
let bondActive = bondData && new Date(bondData.endDate) >= new Date();
let bondTimerInterval = null;

/* =============================
   LOGIN & REGISTER SYSTEM
   ============================= */
const registerBox = document.getElementById("register-box");
const loginBox = document.getElementById("login-box");
const showLoginBtn = document.getElementById("show-login");
const showRegisterBtn = document.getElementById("show-register");

if (showLoginBtn && showRegisterBtn) {
  showLoginBtn.addEventListener("click", () => {
    registerBox.style.display = "none";
    loginBox.style.display = "block";
  });
  showRegisterBtn.addEventListener("click", () => {
    loginBox.style.display = "none";
    registerBox.style.display = "block";
  });
}

const registerBtn = document.getElementById("register-btn");
if (registerBtn) {
  registerBtn.addEventListener("click", () => {
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    if (!name || !email || !password) return alert("Please fill all fields");

    if (users.find((u) => u.email === email)) return alert("Email already registered");

    const newUser = { name, email, password, points: 100, partnerPoints: 100, history: [] };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful! You can now login.");
    registerBox.style.display = "none";
    loginBox.style.display = "block";
  });
}

const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      loggedInUser = user;
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      window.location.href = "pages/bond-setup.html";
    } else {
      alert("Invalid email or password");
    }
  });
}

/* =============================
   LOGOUT
   ============================= */
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "../index.html";
  });
}

/* =============================
   DASHBOARD SYSTEM
   ============================= */
if (loggedInUser && document.getElementById("userPoints")) {
  let userPoints = loggedInUser.points;
  let partnerPoints = loggedInUser.partnerPoints;
  let history = loggedInUser.history || [];

  const userPointsEl = document.getElementById("userPoints");
  const partnerPointsEl = document.getElementById("partnerPoints");

  function updatePoints() {
    userPointsEl.textContent = userPoints;
    partnerPointsEl.textContent = partnerPoints;
  }

  function saveData() {
    users = users.map(u =>
      u.email === loggedInUser.email
        ? { ...u, points: userPoints, partnerPoints, history }
        : u
    );
    localStorage.setItem("users", JSON.stringify(users));
    loggedInUser = { ...loggedInUser, points: userPoints, partnerPoints, history };
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    updateBondLevel();
  }

  function addHistory(message) {
    const historyBox = document.getElementById("history");
    if (!historyBox) return;
    if (historyBox.children.length === 1 && historyBox.children[0].textContent === "No history yet.") {
      historyBox.innerHTML = "";
    }
    const entry = document.createElement("div");
    entry.classList.add("list-item");
    entry.textContent = message;
    historyBox.prepend(entry);
    history.unshift(message);
    saveData();
  }

  // Restore history
  const historyBox = document.getElementById("history");
  if (historyBox && history.length > 0) {
    historyBox.innerHTML = "";
    history.forEach(msg => {
      const entry = document.createElement("div");
      entry.classList.add("list-item");
      entry.textContent = msg;
      historyBox.appendChild(entry);
    });
  }

  const interactionForm = document.getElementById("interactionForm");
  if (interactionForm) {
    interactionForm.addEventListener("submit", (e) => {
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

      updatePoints();
      addHistory(`${person === "you" ? "You" : "Partner"} lost ${deduction} pts due to ${damage} damage (${incident}).`);
      interactionForm.reset();
    });
  }

  updatePoints();
}

/* =============================
   BOND SETUP SYSTEM
   ============================= */
if (loggedInUser && document.getElementById("bondSetupForm")) {
  const bondSetupForm = document.getElementById("bondSetupForm");
  const userNameInput = document.getElementById("userName");
  const partnerNameInput = document.getElementById("partnerName");
  const bondTypeSelect = document.getElementById("bondType");
  const bondDurationSelect = document.getElementById("bondDuration");
  const bondStartDateInput = document.getElementById("bondStartDate");
  const bondEndDateInput = document.getElementById("bondEndDate");
  const bondSummary = document.getElementById("bondSummary");
  const startBondBtn = document.getElementById("startBondBtn");
  const bondInfo = document.getElementById("bondInfo");

  const today = new Date().toISOString().split("T")[0];
  bondStartDateInput.value = today;
  bondStartDateInput.setAttribute("min", today);
  bondEndDateInput.value = today;
  bondEndDateInput.setAttribute("min", today);

  function updateEndDate() {
    const startDate = new Date(bondStartDateInput.value);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + parseInt(bondDurationSelect.value));
    bondEndDateInput.value = endDate.toISOString().split("T")[0];
  }
  bondDurationSelect.addEventListener("change", updateEndDate);
  bondStartDateInput.addEventListener("change", updateEndDate);
  updateEndDate();

  function updateSummary() {
    bondSummary.innerHTML = `
      <p><strong>${userNameInput.value || "Your Name"}</strong> & <strong>${partnerNameInput.value || "Partner's Name"}</strong></p>
      <p>Bond Type: <strong>${bondTypeSelect.options[bondTypeSelect.selectedIndex].text}</strong></p>
      <p>Duration: <strong>${bondStartDateInput.value}</strong> to <strong>${bondEndDateInput.value}</strong></p>
    `;
  }
  [userNameInput, partnerNameInput, bondTypeSelect, bondStartDateInput, bondEndDateInput].forEach(el => el.addEventListener("input", updateSummary));
  updateSummary();

  function displayBondInfo() {
    if (bondActive && bondData) {
      bondInfo.innerHTML = `
        <h3>Current Bond</h3>
        <p><strong>${bondData.userName}</strong> & <strong>${bondData.partnerName}</strong></p>
        <p>Type: <strong>${bondTypeSelect.options[bondTypeSelect.selectedIndex].text}</strong></p>
        <p>Duration: <strong>${bondData.startDate}</strong> to <strong>${bondData.endDate}</strong></p>
        <p id="bondTimer"></p>
        <button id="endBondBtn">End Bond</button>
      `;
      document.getElementById("endBondBtn").addEventListener("click", endBond);
      startBondTimer();
    } else {
      bondInfo.innerHTML = "<p>No active bond. Please set up a new bond.</p>";
    }
  }

  function startBond() {
    if (!userNameInput.value.trim() || !partnerNameInput.value.trim()) return alert("Please enter both names.");
    if (new Date(bondEndDateInput.value) < new Date(bondStartDateInput.value)) return alert("End date must be after start date.");

    bondData = {
      userName: userNameInput.value.trim(),
      partnerName: partnerNameInput.value.trim(),
      bondType: bondTypeSelect.value,
      startDate: bondStartDateInput.value,
      endDate: bondEndDateInput.value,
    };
    localStorage.setItem("bondData", JSON.stringify(bondData));
    bondActive = true;
    alert("Bond started successfully!");
    displayBondInfo();
  }

  function endBond() {
    if (!confirm("Are you sure you want to end the bond?")) return;
    bondActive = false;
    bondData = null;
    localStorage.removeItem("bondData");
    if (bondTimerInterval) clearInterval(bondTimerInterval);
    alert("Bond ended.");
    displayBondInfo();
  }

  function startBondTimer() {
    if (!bondData) return;
    if (bondTimerInterval) clearInterval(bondTimerInterval);
    bondTimerInterval = setInterval(() => {
      const now = new Date();
      const end = new Date(bondData.endDate);
      const diff = end - now;
      const timerEl = document.getElementById("bondTimer");
      if (diff <= 0) {
        timerEl.textContent = "Bond has ended.";
        clearInterval(bondTimerInterval);
        bondActive = false;
        bondData = null;
        localStorage.removeItem("bondData");
        alert("Bond duration has ended.");
        displayBondInfo();
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      timerEl.textContent = `Time Remaining: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  }

  startBondBtn.addEventListener("click", startBond);
  displayBondInfo();
}

/* =============================
   BOND LEVEL PROGRESS
   ============================= */
function updateBondLevel() {
  if (!loggedInUser) return;
  const totalPoints = loggedInUser.points + (bondData?.partnerPoints || 0);
  const maxPoints = 1000;
  let level = Math.floor((totalPoints / maxPoints) * 10);
  if (level < 1) level = 1;
  if (level > 10) level = 10;

  const userProgress = document.getElementById("userProgress");
  const partnerProgress = document.getElementById("partnerProgress");
  if (userProgress) userProgress.style.width = Math.min((loggedInUser.points / 500) * 100, 100) + "%";
  if (partnerProgress) partnerProgress.style.width = Math.min((bondData?.partnerPoints / 500) * 100, 100) + "%";

  const bondLevelText = document.getElementById("bondLevel");
  if (bondLevelText) bondLevelText.textContent = level;
}

updateBondLevel();
