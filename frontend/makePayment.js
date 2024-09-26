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
    console.log("Payee data:", payeeData);

    if (!payeeData || !payeeData["Account Number"]) {
      console.error("Payee not found or invalid data received");
      return;
    }

    const payeeAccountNumber = payeeData["Account Number"];

    // Get payer's account number from localStorage
    const payerAccountNumber = localStorage.getItem('accountNumber');
    if (!payerAccountNumber) {
      console.error("Payer account number not found in localStorage");
      return;
    }

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

    console.log("Payment successful");

  } catch (error) {
    console.error("An error occurred during the payment process:", error);
  }
});
