/* =============================
   INITIALIZATION
   ============================= */

// Load users and logged-in user from localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;

// Redirect to login if user is not logged in on protected pages
const protectedPages = ["/pages/dashboard.html", "/pages/bond-setup.html"];
if (!loggedInUser && protectedPages.includes(window.location.pathname)) {
    alert("Please login first!");
    window.location.href = "/index.html";
}

// Helper function to safely get element by ID
function $(id) {
    return document.getElementById(id);
}

/* =============================
   REGISTER & LOGIN SYSTEM
   ============================= */

// Show Register / Login Forms
const registerBox = $("register-box");
const loginBox = $("login-box");

const showLoginBtn = $("show-login");
const showRegisterBtn = $("show-register");

if (showLoginBtn && showRegisterBtn && registerBox && loginBox) {
    showLoginBtn.addEventListener("click", () => {
        registerBox.style.display = "none";
        loginBox.style.display = "block";
    });

    showRegisterBtn.addEventListener("click", () => {
        loginBox.style.display = "none";
        registerBox.style.display = "block";
    });
}

// Register button
const registerBtn = $("register-btn");
if (registerBtn) {
    registerBtn.addEventListener("click", () => {
        const name = $("reg-name").value.trim();
        const email = $("reg-email").value.trim();
        const password = $("reg-password").value.trim();

        if (!name || !email || !password) {
            alert("Please fill all fields");
            return;
        }

        if (users.find(u => u.email === email)) {
            alert("Email already registered");
            return;
        }

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
const loginBtn = $("login-btn");
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const email = $("login-email").value.trim();
        const password = $("login-password").value.trim();

        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            loggedInUser = user;
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            alert(`Welcome ${user.name}!`);
            window.location.href = "pages/bond-setup.html";
        } else {
            alert("Invalid email or password");
        }
    });
}

/* =============================
   DASHBOARD SYSTEM
   ============================= */
if (loggedInUser && $("userPoints")) {
    let userPoints = loggedInUser.points;
    let partnerPoints = loggedInUser.partnerPoints;
    let history = loggedInUser.history || [];

    function updatePoints() {
        $("userPoints").textContent = userPoints;
        $("partnerPoints").textContent = partnerPoints;
        updateBondLevel();
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
    }

    function addHistory(message) {
        const historyBox = $("history");
        if (historyBox) {
            if (historyBox.querySelector(".list-item") && historyBox.children.length === 1 && historyBox.children[0].textContent === "No history yet.") {
                historyBox.innerHTML = "";
            }
            const entry = document.createElement("div");
            entry.classList.add("list-item");
            entry.textContent = message;
            historyBox.prepend(entry);

            history.unshift(message);
            saveData();
        }
    }

    const historyBox = $("history");
    if (historyBox && history.length > 0) {
        historyBox.innerHTML = "";
        history.forEach(msg => {
            const entry = document.createElement("div");
            entry.classList.add("list-item");
            entry.textContent = msg;
            historyBox.appendChild(entry);
        });
    }

    const interactionForm = $("interactionForm");
    if (interactionForm) {
        interactionForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const incident = $("incident").value.trim();
            const person = $("person").value;
            const damage = $("damage").value;

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

// Logout button
const logoutBtn = $("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "../index.html";
    });
}

/* =============================
   BOND SETUP SYSTEM
   ============================= */
if (loggedInUser && $("bondSetupForm")) {
    const bondSetupForm = $("bondSetupForm");
    const userNameInput = $("userName");
    const partnerNameInput = $("partnerName");
    const bondTypeSelect = $("bondType");
    const bondDurationSelect = $("bondDuration");
    const bondStartDateInput = $("bondStartDate");
    const bondEndDateInput = $("bondEndDate");
    const bondSummary = $("bondSummary");
    const startBondBtn = $("startBondBtn");
    const bondInfo = $("bondInfo");

    const today = new Date().toISOString().split("T")[0];
    bondStartDateInput.setAttribute("min", today);
    bondStartDateInput.value = today;
    bondEndDateInput.setAttribute("min", today);
    bondEndDateInput.value = today;

    let bondData = JSON.parse(localStorage.getItem("bondData")) || null;
    let bondActive = bondData && new Date(bondData.endDate) >= new Date();
    let bondTimerInterval = null;

    function updateEndDate() {
        const startDate = new Date(bondStartDateInput.value);
        let endDate = new Date(startDate);
        const duration = parseInt(bondDurationSelect.value);
        endDate.setDate(endDate.getDate() + duration);
        bondEndDateInput.value = endDate.toISOString().split("T")[0];
        bondEndDateInput.setAttribute("min", bondEndDateInput.value);
    }
    bondDurationSelect.addEventListener("change", updateEndDate);
    bondStartDateInput.addEventListener("change", updateEndDate);
    updateEndDate();

    function updateSummary() {
        const userName = userNameInput.value || "Your Name";
        const partnerName = partnerNameInput.value || "Partner's Name";
        const bondType = bondTypeSelect.options[bondTypeSelect.selectedIndex].text;
        const startDate = bondStartDateInput.value;
        const endDate = bondEndDateInput.value;

        if (bondSummary) {
            bondSummary.innerHTML = `
                <p><strong>${userName}</strong> & <strong>${partnerName}</strong></p>
                <p>Bond Type: <strong>${bondType}</strong></p>
                <p>Duration: <strong>${startDate}</strong> to <strong>${endDate}</strong></p>
            `;
        }
    }

    [userNameInput, partnerNameInput, bondTypeSelect, bondStartDateInput, bondEndDateInput].forEach(el => {
        el.addEventListener("input", updateSummary);
        el.addEventListener("change", updateSummary);
    });
    updateSummary();

    function displayBondInfo() {
        if (bondInfo) {
            if (bondActive && bondData) {
                bondInfo.innerHTML = `
                    <h3>Current Bond</h3>
                    <p><strong>${bondData.userName}</strong> & <strong>${bondData.partnerName}</strong></p>
                    <p>Type: <strong>${bondTypeSelect.options[bondTypeSelect.selectedIndex].text}</strong></p>
                    <p>Duration: <strong>${bondData.startDate}</strong> to <strong>${bondData.endDate}</strong></p>
                    <p id="bondTimer"></p>
                    <button id="endBondBtn">End Bond</button>
                `;
                $("endBondBtn").addEventListener("click", endBond);
            } else {
                bondInfo.innerHTML = "<p>No active bond. Please set up a new bond.</p>";
            }
        }
    }

    function endBond() {
        if (confirm("Are you sure you want to end the bond?")) {
            bondActive = false;
            bondData = null;
            localStorage.removeItem("bondData");
            if (bondTimerInterval) clearInterval(bondTimerInterval);
            alert("Bond ended.");
            displayBondInfo();
        }
    }

    function startBondTimer() {
        if (!bondData) return;
        if (bondTimerInterval) clearInterval(bondTimerInterval);
        bondTimerInterval = setInterval(() => {
            const now = new Date();
            const end = new Date(bondData.endDate);
            const diff = end - now;
            const timerEl = $("bondTimer");
            if (!timerEl) return;

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

        bondData = { userName, partnerName, bondType, startDate, endDate };
        localStorage.setItem("bondData", JSON.stringify(bondData));
        bondActive = true;
        alert("Bond started successfully!");
        startBondTimer();
        displayBondInfo();
    });

    if (bondActive) startBondTimer();
    displayBondInfo();
}

/* =============================
   BOND LEVEL / PROGRESS
   ============================= */
function updateBondLevel() {
    if (!loggedInUser) return;

    let bondData = JSON.parse(localStorage.getItem("bondData"));
    if (!bondData) return;

    const totalPoints = loggedInUser.points + bondData.partnerPoints;
    const maxPoints = 1000; // define max points for level 10
    let level = Math.floor((totalPoints / maxPoints) * 10);
    if (level < 1) level = 1;
    if (level > 10) level = 10;

    const userProgress = $("userProgress");
    const partnerProgress = $("partnerProgress");
    if (userProgress) userProgress.style.width = Math.min((loggedInUser.points / 500) * 100, 100) + "%";
    if (partnerProgress) partnerProgress.style.width = Math.min((bondData.partnerPoints / 500) * 100, 100) + "%";

    const bondLevelText = $("bondLevel");
    if (bondLevelText) bondLevelText.textContent = level;
}
updateBondLevel();
