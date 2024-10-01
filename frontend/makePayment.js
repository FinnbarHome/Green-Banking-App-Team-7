document.getElementById("payNowButton").addEventListener("click", handlePayment);

async function handlePayment(event) {
  event.preventDefault(); // Prevent form from submitting

  try {
    const paymentAmount = parseFloat(document.getElementById("payment-amount").value);
    const payeeName = document.getElementById("payee-name").value;
    const paymentReference = document.getElementById("payment-reference").value;

    validatePaymentInputs(payeeName, paymentAmount);

    const payeeAccountNumber = await fetchPayeeAccountNumber(payeeName);
    const payerAccountNumber = getPayerAccountNumber();

    const transactionData = createTransactionData(payerAccountNumber, payeeAccountNumber, paymentAmount, paymentReference);

    await processTransaction(transactionData);

    // On successful payment, update the UI
    clearBox({ payeeName, paymentAmount, xp: 100, streak: 5, level: 3, progress: 60 });
  } catch (error) {
    console.error("Error during payment:", error);
  }
}

// Helper function to validate payment inputs
function validatePaymentInputs(payeeName, paymentAmount) {
  if (!payeeName) throw new Error("Payee name is required");
  if (isNaN(paymentAmount) || paymentAmount <= 0) throw new Error("Invalid payment amount");
}

// Fetch payee's account number by name
async function fetchPayeeAccountNumber(payeeName) {
  const response = await fetch(`/api/companies/name/${payeeName}`);
  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(`Error fetching payee data: ${error}`);
  }
  const payeeData = await response.json();
  return payeeData["Account Number"];
}

// Get payer's account number from localStorage
function getPayerAccountNumber() {
  const payerAccountNumber = localStorage.getItem('accountNumber');
  if (!payerAccountNumber) throw new Error("Payer account number not found in localStorage");
  return parseInt(payerAccountNumber);
}

// Create transaction data object
function createTransactionData(payerAccountNumber, payeeAccountNumber, paymentAmount, paymentReference) {
  return {
    Recipient: payeeAccountNumber,
    Sender: payerAccountNumber,
    Amount: paymentAmount,
    Reference: paymentReference
  };
}

// Process transaction by sending it to the backend
async function processTransaction(transactionData) {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactionData)
  });
  if (!response.ok) throw new Error('Error processing transaction');
}

// Calculate user level
function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0, nextLevel = 0, previousLevel = 0, progressPercentage = 0;

  levelBounds.forEach((bound, i) => {
    if (userXP >= bound) {
      level = i + 1;
      previousLevel = bound;
      nextLevel = levelBounds[i + 1] || bound;
    }
  });

  if (level < levelBounds.length) {
    const xpForNextLevel = nextLevel - previousLevel;
    const currentLevelProgress = userXP - previousLevel;
    progressPercentage = (currentLevelProgress / xpForNextLevel) * 100;
  } else {
    progressPercentage = 100;
  }

  return { level, progressPercentage: Math.round(progressPercentage * 100) / 100, currentXP: userXP, nextLevelXP: nextLevel };
}

// Levels array generator
function Levels() {
  return Array.from({ length: 11 }, (_, i) => Math.round(Math.pow(i / 0.3, 2.5)));
}

// Clear UI and update with payment success details
function clearBox({ payeeName, paymentAmount, xp, streak, level, progress }) {
  document.getElementById("paymentElements").innerHTML = `
    <h1 class="text-3xl text-green-400 font-bold text-white mt-5 text-center">Payment Successful!</h1>
    <h2 class="text-xl font-bold text-white text-center py-2 pb-5">Your payment to: <span class="text-green-400">${payeeName}</span></h2>
    <div class="border-green-800 border-2 py-5 border-x-0">
      <div class="grid grid-flow-col gap-1 mb-2">
        <h2 class="text-xl font-bold text-white px-5 rounded-l-lg">You spent...</h2>
        <h2 class="text-xl text-white text-right px-5 rounded-r-lg text-red-300">-£${paymentAmount.toFixed(2)}</h2>
      </div>
      <div class="grid grid-flow-col gap-1 mb-2">
        <h2 class="text-xl font-bold text-white px-5 rounded-l-lg">You gained...</h2>
        <h2 class="text-xl text-white text-right px-5 rounded-r-lg">${xp} XP</h2>
      </div>
      <div class="grid grid-flow-col gap-1 mb-2">
        <h2 class="text-xl font-bold text-white px-5 rounded-l-lg">Your streak is...</h2>
        <h2 class="text-xl text-white text-right px-5 rounded-r-lg">${streak}</h2>
      </div>
      <div class="grid grid-flow-col gap-1 mb-2">
        <h2 class="text-xl font-bold text-white px-5 rounded-l-lg">Your level is...</h2>
        <h2 class="text-xl text-white text-right px-5 rounded-r-lg">${level}</h2>
      </div>
      <div class="border-2 border-x-0 border-green-800 pb-5 border-t-0">
        <h2 class="text-xl mt-3 font-bold text-center text-white mb-3">Your progress to the next green level:</h2>
        <div class="w-full h-6 mt-2 rounded-full bg-green-900">
          <div id="progress-bar" class="h-6 bg-green-600 rounded-full" style="width: ${progress}%"></div>
        </div>
      </div>
      <div class="flex justify-center space-x-4">
        <button id="HomeButton" class="bg-green-700 text-white font-bold py-2 px-4 rounded mx-2 my-5">Back to Account Screen</button>
      </div>
    </div>`;
}
