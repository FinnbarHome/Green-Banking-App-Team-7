import CONFIG from "./config.js";

// Get the API backend base URL from the config file
const API_BASE_URL = CONFIG.API_BASE_URL;

// General function to make API requests
async function apiRequest(endpoint, method = "GET", body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || `Failed to ${method} at ${url}`);
    return data;
  } catch (error) {
    console.error(`API Request Error: ${error.message}`);
    throw error;
  }
}

// Add event listener for the payment button
document
  .getElementById("payNowButton")
  .addEventListener("click", handlePayment);

// Handle payment submission
async function handlePayment(event) {
  event.preventDefault();

  try {
    // Get payment form values
    const paymentAmount = parseFloat(
      document.getElementById("payment-amount").value
    );
    const payeeName = document.getElementById("payee-name").value;
    const paymentReference = document.getElementById("payment-reference").value;
    const enteredPayeeAccountNumber = parseInt(
      document.getElementById("payee-account-number").value
    );

    // Validate inputs
    validateInput(payeeName, paymentAmount, enteredPayeeAccountNumber);

    // Fetch payee data and validate account number
    const payeeData = await apiRequest(
      `/companies/name/${encodeURIComponent(payeeName)}`
    );
    if (payeeData["Account Number"] !== enteredPayeeAccountNumber) {
      alert("Account numbers do not match");
      throw new Error("Account numbers do not match");
    }

    // Fetch payer data and calculate Environmental Impact Score (EIS)
    const payerAccountNumber = getPayerAccountNumber();
    const payerData = await apiRequest(`/companies/${payerAccountNumber}`);
    const EIS = calculateEIS(payeeData);

    // Calculate streak and EIS adjustments
    const shouldUpdateStreak = payeeData["Spending Category"] !== "User";
    const { streak, updatedEIS } = calculateStreakAndEIS(
      EIS,
      payerData,
      shouldUpdateStreak
    );

    // Process the payment
    await processPayment(
      payerAccountNumber,
      payeeData["Account Number"],
      paymentAmount,
      paymentReference,
      updatedEIS
    );

    // Update user XP and streak
    await updateUserXPAndStreak(
      payerAccountNumber,
      streak,
      updatedEIS,
      paymentAmount
    );

    // Fetch updated payer data and recalculate level
    const updatedPayerData = await apiRequest(
      `/companies/${payerAccountNumber}`
    );
    const updatedLevelInfo = calculateUserLevel(updatedPayerData["XP"]);

    // Display payment confirmation
    const XPGain = Math.min(Math.round(updatedEIS * paymentAmount), 1000);
    DisplayConfirmation(
      payeeName,
      paymentAmount,
      XPGain,
      streak,
      updatedLevelInfo.level
    );

    // Update progress bar
    document.getElementById(
      "progress-bar"
    ).style.width = `${updatedLevelInfo.progressPercentage}%`;
  } catch (error) {
    if (error.message.includes("Company not found")) {
      alert("The payee name you entered does not exist, please try again.");
    } else {
      console.error("An error occurred during the payment process:", error);
      alert("An unexpected error occurred, please try again.");
    }
  }
}

// Validate payment inputs
function validateInput(payeeName, paymentAmount, enteredPayeeAccountNumber) {
  if (!payeeName) throw new Error("Payee name is required");
  if (isNaN(paymentAmount) || paymentAmount <= 0)
    throw new Error("Invalid payment amount");
  if (!enteredPayeeAccountNumber)
    throw new Error("Payee account number is required");
}

// Get payer account number from local storage
function getPayerAccountNumber() {
  const accountNumber = localStorage.getItem("accountNumber");
  if (!accountNumber) throw new Error("Payer account number not found");
  return parseInt(accountNumber);
}

// Calculate Environmental Impact Score (EIS)
function calculateEIS({
  "Carbon Emissions": CE = 0,
  "Waste Management": WM = 0,
  "Sustainability Practices": SP = 0,
}) {
  return (CE + WM + SP) / 30;
}

// Calculate streak and adjust EIS
function calculateStreakAndEIS(EIS, payerData, shouldUpdateStreak) {
  const greenThreshold = 0.7;
  const redThreshold = 0.3;
  const streakMultiplier = 0.1;
  let streak = payerData["Streak"] || 0;

  const isGreenTransaction = EIS >= greenThreshold;
  const isRedTransaction = EIS <= redThreshold;

  if (shouldUpdateStreak) {
    streak = isGreenTransaction
      ? streak < 0
        ? 1
        : streak + 1
      : isRedTransaction
      ? streak > 0
        ? -1
        : streak - 1
      : 0;
  }

  const greenStreak = Math.max(0, streak);
  const redStreak = Math.abs(Math.min(0, streak));

  if (greenStreak >= 5) {
    EIS += Math.floor(greenStreak / 5) * streakMultiplier;
  }

  if (redStreak >= 3) {
    const levelInfo = calculateUserLevel(payerData["XP"] || 0);
    EIS -= Math.floor(redStreak / 3) * streakMultiplier * (levelInfo.level / 2);
  }

  return { streak, updatedEIS: EIS };
}

// Process payment by updating balances and posting the transaction
async function processPayment(
  payerAccountNumber,
  payeeAccountNumber,
  paymentAmount,
  paymentReference,
  updatedEIS
) {
  const XPGain = Math.min(Math.round(updatedEIS * paymentAmount), 1000);

  await apiRequest(`/companies/update-balance/${payerAccountNumber}`, "PUT", {
    amount: -paymentAmount,
  });
  await apiRequest(`/companies/update-balance/${payeeAccountNumber}`, "PUT", {
    amount: paymentAmount,
  });

  await apiRequest("/transactions", "POST", {
    Recipient: payeeAccountNumber,
    Sender: payerAccountNumber,
    Amount: paymentAmount,
    Reference: paymentReference,
  });

  return XPGain;
}

// Update user XP and streak
async function updateUserXPAndStreak(
  accountNumber,
  streak,
  updatedEIS,
  paymentAmount
) {
  const XPGain = Math.min(Math.round(updatedEIS * paymentAmount), 1000);

  await apiRequest(`/companies/update-xp/${accountNumber}`, "PUT", {
    xpAmount: XPGain,
  });
  await apiRequest(`/companies/update-streak/${accountNumber}`, "PUT", {
    streakValue: streak,
  });
}

// Display payment confirmation screen
function DisplayConfirmation(
  payeeName,
  paymentAmount,
  xpGained,
  streak,
  level
) {
  const streakColor = streak >= 0 ? "text-green-400" : "text-red-400";
  const streakDisplay = Math.abs(streak);

  document.getElementById("paymentElements").innerHTML = `
        <h1 class="text-3xl text-green-400 font-bold text-white mt-5 text-center">Payment Successful!</h1>
        <h2 class="text-xl font-bold text-white text-center py-2 pb-5">Your payment to: <span class="text-green-400">${payeeName}</span></h2>
        ...
    `;

  document.getElementById("HomeButton").addEventListener("click", () => {
    window.location.href = "home.html";
  });
}
