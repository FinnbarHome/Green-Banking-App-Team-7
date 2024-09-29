// Payment logic
document.getElementById("payNowButton").addEventListener("click", async (event) => {
  event.preventDefault(); // Prevent form from submitting and reloading the page

  try {
    var paymentAmount = parseFloat(document.getElementById("payment-amount").value);
    var payeeName = document.getElementById("payee-name").value;
    var paymentReference = document.getElementById("payment-reference").value;

    if (!payeeName) {
      throw new Error("Payee name is required");
    }

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error("Invalid payment amount");
    }

    // Fetch payee's company data
    const payeeResponse = await fetch(`/api/companies/name/${payeeName}`);
    if (!payeeResponse.ok) {
      const errorData = await payeeResponse.json();
      throw new Error(`Error fetching payee data: ${errorData.error}`);
    }

    const payeeData = await payeeResponse.json();
    if (!payeeData || !payeeData["Account Number"]) {
      throw new Error("Payee not found or invalid data received");
    }

    const payeeAccountNumber = payeeData["Account Number"];
    const CE = payeeData["Carbon Emissions"] || 0;
    const WM = payeeData["Waste Management"] || 0;
    const SP = payeeData["Sustainability Practices"] || 0;

    // Calculate EIS
    let EIS = (CE + WM + SP) / 30;

    // Get payer's account number from localStorage
    let payerAccountNumber = localStorage.getItem('accountNumber');
    if (!payerAccountNumber) {
      throw new Error("Payer account number not found in localStorage");
    }

    payerAccountNumber = parseInt(payerAccountNumber);

    // Fetch payer's account data
    const payerResponse = await fetch(`/api/companies/${payerAccountNumber}`);
    if (!payerResponse.ok) {
      const errorData = await payerResponse.json();
      throw new Error(`Error fetching payer data: ${errorData.error}`);
    }
    const payerData = await payerResponse.json();

    let streak = payerData["Streak"] || 0;
    let userXP = payerData["XP"] || 0;

    const greenThreshold = 0.7;
    const redThreshold = 0.3;
    const streakMultiplier = 0.1;
    var redStreakMultiplier = 0;
    var greenStreakMultiplier = 0;

    let isGreenTransaction = EIS > greenThreshold;
    let isRedTransaction = EIS < redThreshold;

    if (isGreenTransaction) {
      streak = streak < 0 ? 1 : streak + 1;
    } else if (isRedTransaction) {
      streak = streak > 0 ? -1 : streak - 1;
    } else {
      streak = 0;
    }

    let greenStreak = Math.max(0, streak);
    let redStreak = Math.abs(Math.min(0, streak));

    if (greenStreak % 5 === 0 && greenStreak > 0) {
      greenStreakMultiplier = Math.floor(greenStreak / 5);
      EIS += greenStreakMultiplier * streakMultiplier;
    }

    if (redStreak % 5 === 0 && redStreak > 0 || redStreak > 5) {
      let levelInfo = calculateUserLevel(userXP);
      let decreaseRed = levelInfo.level / 2;
      redStreakMultiplier = Math.floor(redStreak / 5);
      EIS -= redStreakMultiplier * streakMultiplier * decreaseRed;
    }

    console.log(streak);

    let XPGain = Math.round(EIS * paymentAmount);

    // Update payer's balance (deduct payment amount)
    const payerUpdateResponse = await fetch(`/api/companies/update-balance/${payerAccountNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: -paymentAmount })
    });

    if (!payerUpdateResponse.ok) {
      const errorData = await payerUpdateResponse.json();
      throw new Error(`Error updating payer's balance: ${errorData.error}`);
    }

    // Update payee's balance (add payment amount)
    const payeeUpdateResponse = await fetch(`/api/companies/update-balance/${payeeAccountNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: paymentAmount })
    });

    if (!payeeUpdateResponse.ok) {
      const errorData = await payeeUpdateResponse.json();
      throw new Error(`Error updating payee's balance: ${errorData.error}`);
    }

    const transactionData = {
      Recipient: payeeAccountNumber,
      Sender: payerAccountNumber,
      Amount: paymentAmount,
      Reference: paymentReference
    };

    const transactionResponse = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });

    // Update XP for the payer
    const payerXPUpdate = await fetch(`/api/companies/update-xp/${payerAccountNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xpAmount: XPGain })
    });

    if (!payerXPUpdate.ok) {
      const errorData = await payerXPUpdate.json();
      throw new Error(`Error updating payer's XP: ${errorData.error}`);
    }

    // Update streak for the payer
    const payerStreakUpdate = await fetch(`/api/companies/update-streak/${payerAccountNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streakValue: streak })
    });

    if (!payerStreakUpdate.ok) {
      const errorData = await payerStreakUpdate.json();
      throw new Error(`Error updating payer's streak: ${errorData.error}`);
    }

    // Fetch updated payer data to display new balance and XP
    const updatedPayerResponse = await fetch(`/api/companies/${payerAccountNumber}`);
    if (!updatedPayerResponse.ok) {
      throw new Error(`Error fetching updated payer data`);
    }
    const updatedPayerData = await updatedPayerResponse.json();

    // Update UI with new balance and XP
    document.getElementById("balance").textContent = updatedPayerData.Balance;
    document.getElementById("xp").textContent = updatedPayerData.XP;

    // Show success message to user
    showNotification("Payment successful!", "success");

  } catch (error) {
    console.error("An error occurred during the payment process:", error);
    showNotification(error.message, "error");
  }
});

function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0;
  let NextLevel = 0;
  let PreviousLevel = 0;
  let progressPercentage = 0;

  for (let i = 0; i < levelBounds.length; i++) {
    if (userXP >= levelBounds[i]) {
      level = i + 1;
      PreviousLevel = levelBounds[i];
      if (i + 1 < levelBounds.length) {
        NextLevel = levelBounds[i + 1];
      } else {
        NextLevel = levelBounds[i];
      }
    } else {
      NextLevel = levelBounds[i];
      break;
    }
  }

  if (level < levelBounds.length) {
    let xpForNextLevel = NextLevel - PreviousLevel;
    let currentLevelProgress = userXP - PreviousLevel;
    progressPercentage = (currentLevelProgress / xpForNextLevel) * 100;
  } else {
    progressPercentage = 100;
  }

  return {
    level: level,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    currentXP: userXP,
    nextLevelXP: NextLevel
  };
}

function Levels() {
  const power = 2.5;
  const denominator = 0.3;
  const levelBounds = [];

  for (let i = 0; i < 11; i++) {
    let bounds = i / denominator;
    bounds = Math.pow(bounds, power);
    levelBounds[i] = Math.round(bounds);
  }
  return levelBounds;
}