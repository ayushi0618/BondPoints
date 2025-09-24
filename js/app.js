/* =============================
   REGISTER & LOGIN SYSTEM
   ============================= */

// Show Register / Login Forms
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

// Load users from localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;

// Register button
const registerBtn = document.getElementById("register-btn");
if (registerBtn) {
  registerBtn.addEventListener("click", () => {
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    // Check if email already exists
    if (users.find((user) => user.email === email)) {
      alert("Email already registered");
      return;
    }

    // Create new user with 100 points
    const newUser = {
      name,
      email,
      password,
      points: 100,
      partnerPoints: 100,
      history: [],
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! You can now login.");
    registerBox.style.display = "none";
    loginBox.style.display = "block";
  });
}

// Login button
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      alert(`Welcome ${user.name}!`);
      loggedInUser = user;
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      // Redirect to bond setup page
      window.location.href = "pages/bond-setup.html";
    } else {
      alert("Invalid email or password");
    }
  });
}

/* =============================
   DASHBOARD SYSTEM
   ============================= */

// Load logged-in user data
if (loggedInUser && document.getElementById("userPoints")) {
  let userPoints = loggedInUser.points;
  let partnerPoints = loggedInUser.partnerPoints;
  let history = loggedInUser.history || [];

  // Update points display
  function updatePoints() {
    document.getElementById("userPoints").textContent = userPoints;
    document.getElementById("partnerPoints").textContent = partnerPoints;
  }

  // Save data to localStorage
  function saveData() {
    users = users.map((u) =>
      u.email === loggedInUser.email
        ? { ...u, points: userPoints, partnerPoints, history }
        : u
    );
    localStorage.setItem("users", JSON.stringify(users));

    loggedInUser = {
      ...loggedInUser,
      points: userPoints,
      partnerPoints,
      history,
    };
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
  }

  // Add to transaction history
  function addHistory(message) {
    const historyBox = document.getElementById("history");
    if (
      historyBox.querySelector(".list-item") &&
      historyBox.children.length === 1 &&
      historyBox.children[0].textContent === "No history yet."
    ) {
      historyBox.innerHTML = ""; // clear placeholder
    }
    const entry = document.createElement("div");
    entry.classList.add("list-item");
    entry.textContent = message;
    historyBox.prepend(entry); // newest on top

    history.unshift(message); // save in array
    saveData();
  }

  // Restore history from localStorage
  const historyBox = document.getElementById("history");
  if (history.length > 0 && historyBox) {
    historyBox.innerHTML = "";
    history.forEach((msg) => {
      const entry = document.createElement("div");
      entry.classList.add("list-item");
      entry.textContent = msg;
      historyBox.appendChild(entry);
    });
  }

  // Handle interaction form
  const interactionForm = document.getElementById("interactionForm");
  if (interactionForm) {
    interactionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const incident = document.getElementById("incident").value;
      const person = document.getElementById("person").value;
      const damage = document.getElementById("damage").value;

      // Simple point deduction logic
      let deduction = 10;
      if (damage === "mental") deduction = 15;
      if (damage === "trust") deduction = 20;
      if (damage === "time") deduction = 5;

      if (person === "you") {
        userPoints -= deduction;
      } else {
        partnerPoints -= deduction;
      }

      updatePoints();
      addHistory(
        `${person === "you" ? "You" : "Partner"} lost ${deduction} pts due to ${damage} damage (${incident}).`
      );

      interactionForm.reset();
    });
  }

  // Run on page load
  updatePoints();
}
// Logout button
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "../index.html";
  });
}

/* =============================
   BOND SETUP SYSTEM
   ============================= */
// Load bond setup data
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
    const today = new Date().toISOString().split("T")[0];
    bondStartDateInput.setAttribute("min", today);
    bondStartDateInput.value = today;
    bondEndDateInput.setAttribute("min", today);
    bondEndDateInput.value = today;
    let bondData = JSON.parse(localStorage.getItem("bondData")) || null;
    let bondActive = bondData && new Date(bondData.endDate) >= new Date();
    let bondTimerInterval = null;

    // Update end date based on duration
    function updateEndDate() {
      const startDate = new Date(bondStartDateInput.value);
      let endDate = new Date(startDate);
      const duration = bondDurationSelect.value; // in days
      endDate.setDate(endDate.getDate() + parseInt(duration));
      bondEndDateInput.value = endDate.toISOString().split("T")[0];
      bondEndDateInput.setAttribute("min", bondEndDateInput.value);
    }   
    bondDurationSelect.addEventListener("change", updateEndDate);
    bondStartDateInput.addEventListener("change", updateEndDate);
    updateEndDate();    
    // Update summary
    function updateSummary() {
      const userName = userNameInput.value || "Your Name";
      const partnerName = partnerNameInput.value || "Partner's Name";
      const bondType = bondTypeSelect.options[bondTypeSelect.selectedIndex].text;
      const startDate = bondStartDateInput.value;
      const endDate = bondEndDateInput.value;
        bondSummary.innerHTML = `
        <p><strong>${userName}</strong> & <strong>${partnerName}</strong></p>
        <p>Bond Type: <strong>${bondType}</strong></p>
        <p>Duration: <strong>${startDate}</strong> to <strong>${endDate}</strong></p>
      `;
    }   userNameInput.addEventListener("input", updateSummary);
    partnerNameInput.addEventListener("input", updateSummary);
    bondTypeSelect.addEventListener("change", updateSummary);
    bondStartDateInput.addEventListener("change", updateSummary);
    bondEndDateInput.addEventListener("change", updateSummary);
    updateSummary();    
    // Start bond
    startBondBtn.addEventListener("click", () => {
      const userName = userNameInput.value.trim();
      const partnerName = partnerNameInput.value.trim();
      const bondType = bondTypeSelect.value;
      const startDate = bondStartDateInput.value;
      const endDate = bondEndDateInput.value;   
        if (!userName || !partnerName) {    
        alert("Please enter both names.");
        return;
        }
        if (new Date(endDate) < new Date(startDate)) {
        alert("End date must be after start date.");
        return;

        }
        bondData = {
        userName,
        partnerName,
        bondType,
        startDate,  
        endDate,
        };
        localStorage.setItem("bondData", JSON.stringify(bondData));
        bondActive = true;
        alert("Bond started successfully!");
        startBondTimer();
        displayBondInfo();
    }
    );
    // Display bond info
    function displayBondInfo() {
        const bondInfo = document.getElementById("bondInfo");
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
        } else {
        bondInfo.innerHTML = "<p>No active bond. Please set up a new bond.</p>";
        }   }
    // End bond
    function endBond() {
        if (confirm("Are you sure you want to end the bond?")) {
        bondActive = false;
        bondData = null;
        localStorage.removeItem("bondData");

        if (bondTimerInterval) {
            clearInterval(bondTimerInterval);
            bondTimerInterval = null;
        }
        alert("Bond ended.");
        displayBondInfo();
        }   }
    // Bond timer
    function startBondTimer() {
        if (bondTimerInterval) {
        clearInterval(bondTimerInterval);
        bondTimerInterval = null;
        }
        bondTimerInterval = setInterval(() => {
        const now = new Date();
        const end = new Date(bondData.endDate);
        const diff = end - now;
        const timerEl = document.getElementById("bondTimer");
        if (diff <= 0) {
            timerEl.textContent = "Bond has ended.";
            clearInterval(bondTimerInterval);
            bondTimerInterval = null;
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
    // Initialize
    if (bondActive) {
        startBondTimer();
    }   
    displayBondInfo();
}
/* =============================
   END OF FILE
   ============================= */
function updateBondLevel() {
  const totalPoints = currentUser.points + bondData.partnerPoints;
  const maxPoints = 1000; // define max points for level 10
  let level = Math.floor((totalPoints / maxPoints) * 10);
  if (level < 1) level = 1;
  if (level > 10) level = 10;

  // Update progress bars
  const userProgress = document.getElementById("userProgress");
  const partnerProgress = document.getElementById("partnerProgress");
  if (userProgress) userProgress.style.width = Math.min((currentUser.points / 500) * 100, 100) + "%";
  if (partnerProgress) partnerProgress.style.width = Math.min((bondData.partnerPoints / 500) * 100, 100) + "%";

  // Update level text
  const bondLevelText = document.getElementById("bondLevel");
  if (bondLevelText) bondLevelText.textContent = level;
}

// Call after every point change
updateBondLevel();
