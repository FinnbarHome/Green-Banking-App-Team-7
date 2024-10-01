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

    // Calculate XP gain for confirmation
    const XPGain = Math.round(updatedEIS * paymentAmount);

    // Display confirmation with dynamic values

    // Calculate progress percentage for the progress bar
    const levelInfo = calculateUserLevel(payerData["XP"]);
    DisplayConfirmation(payeeName, paymentAmount, XPGain, streak, levelInfo["level"]);
    const progressPercentage = Math.round((payerData["XP"] / levelInfo.nextLevelXP) * 100);
    document.getElementById("progress-bar").style.width = `${progressPercentage}%`;

  } catch (error) {
    if (error.message.includes("Company not found")) {
      alert("The payee name you entered does not exist. Please check and try again."); // User-friendly message
    } else {
      console.error("An error occurred during the payment process:", error);
      alert("An unexpected error occurred. Please try again."); // General error message
    }
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


function DisplayConfirmation(payeeName, paymentAmount, xpGained, streak, level) {
  document.getElementById("paymentElements").innerHTML = `
    <h1 class="text-3xl text-green-400 font-bold text-white mt-5 text-center">Payment Successful!</h1>
    <h2 class="text-xl font-bold text-white text-center py-2 pb-5">Your payment to: <span class="text-green-400">${payeeName}</span></h2>
    <div class ="border-green-800 border-2 py-5 border-x-0">
      <div class="grid grid-flow-col gap-1 mb-2">
        <h2 class="text-xl font-bold text-white px-5 rounded-l-lg">You spent...</h2>
        <h2 id="paymentAmount" class="row-start-1 text-xl text-white text-right px-5 rounded-r-lg">£${paymentAmount.toFixed(2)}</h2>
      </div>
      <div class="grid grid-flow-col gap-1 mb-2">
        <h2 class="text-xl font-bold text-white px-5 rounded-l-lg">You gained...</h2>
        <h2 id="xp" class="row-start-1 text-xl text-white text-right px-5 rounded-r-lg">${xpGained} XP</h2>
      </div>
      <div class="grid grid-flow-col gap-1 mb-2">
        <h2 class="text-xl font-bold text-white px-5 rounded-l-lg">Your streak is...</h2>
        <h2 id="Streak" class="row-start-1 text-xl text-white text-right px-5 rounded-r-lg">${streak}</h2>
      </div>
      <div class="grid grid-flow-col gap-1 mb-2">
        <h2 class="text-xl font-bold text-white px-5 rounded-l-lg">Your level is...</h2>
        <h2 id="Level" class="row-start-1 text-xl text-white text-right px-5 rounded-r-lg">${level}</h2>
      </div>
      <div class="border-2 border-x-0 border-green-800 pb-5 border-t-0">
        <h2 class="text-xl mt-3 font-bold text-center text-white mb-3 ">Your progress to the next green level:</h2>
        <div class="w-full h-6 mt-2 rounded-full bg-green-900">
          <div id="progress-bar" class="h-6 bg-green-600 rounded-full" style="width: 0%"></div>
        </div>
      </div>
      <div class="flex justify-center space-x-4">
        <button id="HomeButton" class="bg-green-700 text-white font-bold py-2 px-4 rounded mx-2 my-5">Back to Account Screen</button>
      </div>
    </div>
  `;

  document.getElementById("HomeButton").addEventListener("click", () => {
    window.location.href = 'home.html';
  });

}

