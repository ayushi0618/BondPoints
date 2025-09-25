const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  window.location.href = " ../index.html";
}

const bondSetupForm = document.getElementById("bondSetupForm");
const userNameInput = document.getElementById("userName");
const partnerNameInput = document.getElementById("partnerName");
const bondTypeSelect = document.getElementById("bondType");
const bondDurationSelect = document.getElementById("bondDuration");
const bondStartDateInput = document.getElementById("bondStartDate");
const bondEndDateInput = document.getElementById("bondEndDate");
const bondSummary = document.getElementById("bondSummary");
const startBondBtn = document.getElementById("startBondBtn");

// Set today as min date
const today = new Date().toISOString().split("T")[0];
bondStartDateInput.min = today;
bondStartDateInput.value = today;
bondEndDateInput.min = today;
bondEndDateInput.value = today;

// Update end date based on duration
function updateEndDate() {
  const startDate = new Date(bondStartDateInput.value);
  let endDate = new Date(startDate);
  const duration = parseInt(bondDurationSelect.value);
  endDate.setDate(endDate.getDate() + duration);
  bondEndDateInput.value = endDate.toISOString().split("T")[0];
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
}
userNameInput.addEventListener("input", updateSummary);
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

  const bondData = { userName, partnerName, bondType, startDate, endDate };
  localStorage.setItem("bondData", JSON.stringify(bondData));
  alert("Bond started successfully!");
  window.location.href = " ./pages/dashboard.html";
});
