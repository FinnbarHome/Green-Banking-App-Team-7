// Payment logic
document.getElementById("payNowButton").addEventListener("click", async (event) => {
  event.preventDefault(); // Prevent form from submitting and reloading the page

  try {
    var paymentAmount = parseFloat(document.getElementById("payment-amount").value);
    var payeeName = document.getElementById("payee-name").value;

    if (!payeeName) {
      console.error("Payee name is required");
      return;
    }

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      console.error("Invalid payment amount");
      return;
    }

    // Fetch payee's company data
    const payeeResponse = await fetch(`/api/companies/name/${payeeName}`);
    if (!payeeResponse.ok) {
      const errorData = await payeeResponse.json();
      console.error("Error fetching payee data:", errorData.error);
      return;
    }

    const payeeData = await payeeResponse.json();
    if (!payeeData || !payeeData["Account Number"]) {
      console.error("Payee not found or invalid data received");
      return;
    }

    const payeeAccountNumber = payeeData["Account Number"];

    // Using let to allow reassignment
    const CE = payeeData["Carbon Emissions"]
    const WM = payeeData["Waste Management"]
    const SP = payeeData["Sustainability Practices"]

    // Calculate EIS directly
    let EIS = (CE + WM + SP) / 30;

    // Calculate XP amount
    var xpAmount = EIS * paymentAmount;

    // Get payer's account number from localStorage
    const payerAccountNumber = localStorage.getItem('accountNumber');
    if (!payerAccountNumber) {
      console.error("Payer account number not found in localStorage");
      return;
    }

    const payerUpdateStreak = await fetch(`/api/companies/update-streak/${payerAccountNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streak: streak })
    });

    // Update payer's balance (deduct payment amount)
    const payerUpdateResponse = await fetch(`/api/companies/update-balance/${payerAccountNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: -paymentAmount })
    });

    if (!payerUpdateResponse.ok) {
      const errorData = await payerUpdateResponse.json();
      console.error("Error updating payer's balance:", errorData.error);
      return;
    }

    // Update payee's balance (add payment amount)
    const payeeUpdateResponse = await fetch(`/api/companies/update-balance/${payeeAccountNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: paymentAmount })
    });

    if (!payeeUpdateResponse.ok) {
      const errorData = await payeeUpdateResponse.json();
      console.error("Error updating payee's balance:", errorData.error);
      return;
    }

    // Update XP for the payer
    console.log("XP Amount to update:", xpAmount);
    if (typeof xpAmount !== 'number') {
      console.error("xpAmount is not a valid number:", xpAmount);
      return; // Prevent the API call if it's not valid
    }

    const payerXPUpdate = await fetch(`/api/companies/update-xp/${payerAccountNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xpAmount })
    });

    if (!payerXPUpdate.ok) {
      const errorData = await payerXPUpdate.json();
      console.error("Error updating payer's XP:", errorData.error);
      return;
    }

    console.log("Payment successful");

  } catch (error) {
    console.error("An error occurred during the payment process:", error);
  }
});