document.getElementById("payNowButton").addEventListener("click", handlePayment);

async function handlePayment(event) {
  event.preventDefault(); // Prevent form from submitting

  try {
    const paymentAmount = parseFloat(document.getElementById("payment-amount").value);
    const payeeName = document.getElementById("payee-name").value;
    const paymentReference = document.getElementById("payment-reference").value;

    validateInput(payeeName, paymentAmount);

    const payeeData = await fetchCompanyDataByName(payeeName);
    const payeeAccountNumber = payeeData["Account Number"];
    const EIS = calculateEIS(payeeData);

    const payerAccountNumber = getPayerAccountNumber();
    const payerData = await fetchCompanyDataByAccount(payerAccountNumber);

    const { streak, updatedEIS } = calculateStreakAndEIS(EIS, payerData);

    await processPayment(payerAccountNumber, payeeAccountNumber, paymentAmount, paymentReference, updatedEIS);

    await updateUserXPAndStreak(payerAccountNumber, streak, updatedEIS, paymentAmount);

    await updatePayerUI(payerAccountNumber);

    showNotification("Payment successful!", "success");

  } catch (error) {
    console.error("An error occurred during the payment process:", error);
    showNotification(error.message, "error");
  }
}

// Helper functions

// Validates payment inputs
function validateInput(payeeName, paymentAmount) {
  if (!payeeName) throw new Error("Payee name is required");
  if (isNaN(paymentAmount) || paymentAmount <= 0) throw new Error("Invalid payment amount");
}

// Fetch company data by name
async function fetchCompanyDataByName(name) {
  return await fetchData(`/api/companies/name/${name}`, "payee data");
}

// Fetch company data by account number
async function fetchCompanyDataByAccount(accountNumber) {
  return await fetchData(`/api/companies/${accountNumber}`, "payer data");
}

// Get payer's account number from local storage
function getPayerAccountNumber() {
  const accountNumber = localStorage.getItem('accountNumber');
  if (!accountNumber) throw new Error("Payer account number not found in localStorage");
  return parseInt(accountNumber);
}

// Fetch and handle errors centrally
async function fetchData(url, entityType) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(`Error fetching ${entityType}: ${data.error}`);
  return data;
}

// Calculate EIS based on payee's sustainability scores
function calculateEIS({ "Carbon Emissions": CE = 0, "Waste Management": WM = 0, "Sustainability Practices": SP = 0 }) {
  return (CE + WM + SP) / 30;
}

// Calculate streak and adjust EIS
function calculateStreakAndEIS(EIS, payerData) {
  const greenThreshold = 0.7;
  const redThreshold = 0.3;
  const streakMultiplier = 0.1;
  let streak = payerData["Streak"] || 0;
  let userXP = payerData["XP"] || 0;

  let isGreenTransaction = EIS > greenThreshold;
  let isRedTransaction = EIS < redThreshold;

  streak = isGreenTransaction ? (streak < 0 ? 1 : streak + 1) : isRedTransaction ? (streak > 0 ? -1 : streak - 1) : 0;

  const greenStreak = Math.max(0, streak);
  const redStreak = Math.abs(Math.min(0, streak));

  if (greenStreak % 5 === 0 && greenStreak > 0) {
    EIS += Math.floor(greenStreak / 5) * streakMultiplier;
  }

  if ((redStreak % 5 === 0 && redStreak > 0) || redStreak > 5) {
    const levelInfo = calculateUserLevel(userXP);
    EIS -= Math.floor(redStreak / 5) * streakMultiplier * (levelInfo.level / 2);
  }

  return { streak, updatedEIS: EIS };
}

// Process payment between payer and payee
async function processPayment(payerAccountNumber, payeeAccountNumber, paymentAmount, paymentReference, updatedEIS) {
  const XPGain = Math.round(updatedEIS * paymentAmount);

  // Update payer and payee balances
  await updateBalance(payerAccountNumber, -paymentAmount);
  await updateBalance(payeeAccountNumber, paymentAmount);

  // Create transaction record
  await postTransaction({
    Recipient: payeeAccountNumber,
    Sender: payerAccountNumber,
    Amount: paymentAmount,
    Reference: paymentReference
  });

  return XPGain;
}

// Update payer's XP and streak
async function updateUserXPAndStreak(payerAccountNumber, streak, updatedEIS, paymentAmount) {
  const XPGain = Math.round(updatedEIS * paymentAmount);

  await updateXP(payerAccountNumber, XPGain);
  await updateStreak(payerAccountNumber, streak);
}

// Update payer's UI after the payment
async function updatePayerUI(payerAccountNumber) {
  const updatedPayerData = await fetchCompanyDataByAccount(payerAccountNumber);

  // Update UI with new balance and XP
  document.getElementById("balance").textContent = updatedPayerData.Balance;
  document.getElementById("xp").textContent = updatedPayerData.XP;
}

// Update user balance
async function updateBalance(accountNumber, amount) {
  await fetchDataWithPut(`/api/companies/update-balance/${accountNumber}`, { amount });
}

// Update user XP
async function updateXP(accountNumber, xpAmount) {
  await fetchDataWithPut(`/api/companies/update-xp/${accountNumber}`, { xpAmount });
}

// Update user streak
async function updateStreak(accountNumber, streakValue) {
  await fetchDataWithPut(`/api/companies/update-streak/${accountNumber}`, { streakValue });
}

// Helper function to handle PUT requests
async function fetchDataWithPut(url, body) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error in PUT request: ${data.error}`);
}

// Post transaction record
async function postTransaction(transactionData) {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactionData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error creating transaction: ${data.error}`);
}

// Calculate user level based on XP
function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0, PreviousLevel = 0, NextLevel = 0, progressPercentage = 0;

  for (let i = 0; i < levelBounds.length; i++) {
    if (userXP >= levelBounds[i]) {
      level = i + 1;
      PreviousLevel = levelBounds[i];
      NextLevel = i + 1 < levelBounds.length ? levelBounds[i + 1] : levelBounds[i];
    } else {
      NextLevel = levelBounds[i];
      break;
    }
  }

  if (level < levelBounds.length) {
    const xpForNextLevel = NextLevel - PreviousLevel;
    progressPercentage = ((userXP - PreviousLevel) / xpForNextLevel) * 100;
  } else {
    progressPercentage = 100;
  }

  return { level, progressPercentage: Math.round(progressPercentage * 100) / 100, currentXP: userXP, nextLevelXP: NextLevel };
}

// Calculate levels
function Levels() {
  const power = 2.5, denominator = 0.3, levelBounds = [];
  for (let i = 0; i < 11; i++) {
    levelBounds[i] = Math.round(Math.pow(i / denominator, power));
  }
  return levelBounds;
}
