document.getElementById("payNowButton").addEventListener("click", handlePayment);

async function handlePayment(event) {
  event.preventDefault(); // Prevent form from submitting

  try {
    // Get values from form
    const paymentAmount = parseFloat(document.getElementById("payment-amount").value);
    const payeeName = document.getElementById("payee-name").value;
    const paymentReference = document.getElementById("payment-reference").value;
    const enteredPayeeAccountNumber = parseInt(document.getElementById("payee-account-number").value); // Capture entered account number

    validateInput(payeeName, paymentAmount, enteredPayeeAccountNumber); // Include payee account number in validation

    // Fetch payee data by name
    const payeeData = await fetchCompanyDataByName(payeeName);
    const payeeAccountNumberFromDB = payeeData["Account Number"];
    const payeeSpendingCategory = payeeData["Spending Category"]; // Get the spending category

    // Compare entered payee account number with the one in the database
    if (enteredPayeeAccountNumber !== payeeAccountNumberFromDB) {
      alert("Entered account number does not match the account number associated with the payee.");
      throw new Error("Entered account number does not match the account number associated with the payee.");
    }

    // Calculate EIS, fetch payer data, and proceed with payment process
    const EIS = calculateEIS(payeeData);
    const payerAccountNumber = getPayerAccountNumber();
    const payerData = await fetchCompanyDataByAccount(payerAccountNumber);

    // Only calculate the streak if the payee's Spending Category is not "User"
    const shouldUpdateStreak = payeeSpendingCategory !== "User";
    const { streak, updatedEIS } = calculateStreakAndEIS(EIS, payerData, shouldUpdateStreak);

    await processPayment(payerAccountNumber, payeeAccountNumberFromDB, paymentAmount, paymentReference, updatedEIS);

    await updateUserXPAndStreak(payerAccountNumber, streak, updatedEIS, paymentAmount);

    // Fetch updated payer data
    const updatedPayerData = await fetchCompanyDataByAccount(payerAccountNumber);

    // Calculate XP gain for confirmation using updated data
    const XPGain = Math.min(Math.round(updatedEIS * paymentAmount), 1000); // Cap XP gain at 1000

    // Recalculate the user's level after the transaction
    const updatedLevelInfo = calculateUserLevel(updatedPayerData["XP"]);

    // Display confirmation with the updated values
    DisplayConfirmation(payeeName, paymentAmount, XPGain, streak, updatedLevelInfo.level);

    // Calculate and update the progress bar using the updated XP and level
    const progressPercentage = updatedLevelInfo.progressPercentage;
    document.getElementById("progress-bar").style.width = `${progressPercentage}%`;

  } catch (error) {
    if (error.message.includes("Company not found")) {
      alert("The payee name you entered does not exist. Please check and try again.");
    } else {
      console.error("An error occurred during the payment process:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  }
}

// Helper functions

// Validates payment inputs
function validateInput(payeeName, paymentAmount, enteredPayeeAccountNumber) {
  if (!payeeName) throw new Error("Payee name is required");
  if (isNaN(paymentAmount) || paymentAmount <= 0) throw new Error("Invalid payment amount");
  if (!enteredPayeeAccountNumber) throw new Error("Payee account number is required");
}

async function fetchCompanyDataByName(name) {
  return await fetchData(`/api/companies/name/${name}`, "payee data");
}

async function fetchCompanyDataByAccount(accountNumber) {
  return await fetchData(`/api/companies/${accountNumber}`, "payer data");
}

function getPayerAccountNumber() {
  const accountNumber = localStorage.getItem('accountNumber');
  if (!accountNumber) throw new Error("Payer account number not found in localStorage");
  return parseInt(accountNumber);
}

async function fetchData(url, entityType) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(`Error fetching ${entityType}: ${data.error}`);
  return data;
}

function calculateEIS({ "Carbon Emissions": CE = 0, "Waste Management": WM = 0, "Sustainability Practices": SP = 0 }) {
  return (CE + WM + SP) / 30;
}

function calculateStreakAndEIS(EIS, payerData, shouldUpdateStreak) {
  const greenThreshold = 0.7;
  const redThreshold = 0.3;
  const streakMultiplier = 0.1;
  let streak = payerData["Streak"] || 0;
  let userXP = payerData["XP"] || 0;

  let isGreenTransaction = EIS >= greenThreshold;
  let isRedTransaction = EIS <= redThreshold;

  if (shouldUpdateStreak) { // Only update the streak if the condition is met
    streak = isGreenTransaction ? (streak < 0 ? 1 : streak + 1) : isRedTransaction ? (streak > 0 ? -1 : streak - 1) : 0;
  }

  const greenStreak = Math.max(0, streak);
  const redStreak = Math.abs(Math.min(0, streak));

  if (greenStreak % 5 === 0 && greenStreak > 0 || greenStreak > 5) {
    EIS += Math.floor(greenStreak / 5) * streakMultiplier;
  }

  if ((redStreak % 3 === 0 && redStreak > 0) || redStreak > 3) {
    const levelInfo = calculateUserLevel(userXP);
    EIS -= Math.floor(redStreak / 3) * streakMultiplier * (levelInfo.level / 2);
  }

  return { streak, updatedEIS: EIS };
}

async function processPayment(payerAccountNumber, payeeAccountNumber, paymentAmount, paymentReference, updatedEIS) {
  const XPGain = Math.min(Math.round(updatedEIS * paymentAmount), 1000); // Cap XP gain at 1000

  await updateBalance(payerAccountNumber, -paymentAmount);
  await updateBalance(payeeAccountNumber, paymentAmount);

  await postTransaction({
    Recipient: payeeAccountNumber,
    Sender: payerAccountNumber,
    Amount: paymentAmount,
    Reference: paymentReference
  });

  return XPGain;
}

async function updateUserXPAndStreak(payerAccountNumber, streak, updatedEIS, paymentAmount) {
  const XPGain = Math.min(Math.round(updatedEIS * paymentAmount), 1000); // Cap XP gain at 1000

  await updateXP(payerAccountNumber, XPGain);
  await updateStreak(payerAccountNumber, streak);
}

async function updateBalance(accountNumber, amount) {
  await fetchDataWithPut(`/api/companies/update-balance/${accountNumber}`, { amount });
}

async function updateXP(accountNumber, xpAmount) {
  await fetchDataWithPut(`/api/companies/update-xp/${accountNumber}`, { xpAmount });
}

async function updateStreak(accountNumber, streakValue) {
  await fetchDataWithPut(`/api/companies/update-streak/${accountNumber}`, { streakValue });
}

async function fetchDataWithPut(url, body) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error in PUT request: ${data.error}`);
}

async function postTransaction(transactionData) {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactionData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error creating transaction: ${data.error}`);
}

function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0, PreviousLevelXP = 0, NextLevelXP = 0;

  for (let i = 0; i < levelBounds.length; i++) {
    if (userXP >= levelBounds[i]) {
      level = i + 1;
      PreviousLevelXP = levelBounds[i];
      NextLevelXP = (i + 1 < levelBounds.length) ? levelBounds[i + 1] : levelBounds[i];
    } else {
      NextLevelXP = levelBounds[i];
      break;
    }
  }

  level = Math.min(level, 10);

  let progressPercentage;
  if (level === 10) {
    const maxXP = levelBounds[levelBounds.length - 1];
    const level9XP = levelBounds[levelBounds.length - 2];
    const xpAboveLevel9 = Math.min(userXP, maxXP) - level9XP;
    const xpForLevel10 = maxXP - level9XP;
    progressPercentage = (xpAboveLevel9 / xpForLevel10) * 100;
  } else {
    const xpForNextLevel = NextLevelXP - PreviousLevelXP;
    const xpProgress = userXP - PreviousLevelXP;
    progressPercentage = (xpProgress / xpForNextLevel) * 100;
  }

  progressPercentage = Math.min(progressPercentage, 100);

  return {
    level,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    currentXP: userXP,
    nextLevelXP:
 NextLevelXP
  };
}

function Levels() {
  const power = 2.5, denominator = 0.3, levelBounds = [];
  for (let i = 0; i < 10; i++) {
    levelBounds[i] = Math.round(Math.pow(i / denominator, power));
  }
  return levelBounds;
}

function DisplayConfirmation(payeeName, paymentAmount, xpGained, streak, level) {
  const streakColor = streak >= 0 ? 'text-green-400' : 'text-red-400';
  const streakDisplay = Math.abs(streak);

  document.getElementById("paymentElements").innerHTML = `
    <h1 class="text-3xl text-green-400 font-bold text-white mt-5 text-center">Payment Successful!</h1>
    <h2 class="text-xl font-bold text-white text-center py-2 pb-5">Your payment to: <span class="text-green-400">${payeeName}</span></h2>
    <div class="border-green-800 border-2 py-5 border-x-0">
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
        <h2 id="Streak" class="row-start-1 text-xl ${streakColor} text-right px-5 rounded-r-lg">${streakDisplay}</h2>
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
