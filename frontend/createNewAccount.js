async function CreateNewAccount() {
    const companyName = document.getElementById("username").value;
    const balance = parseFloat(document.getElementById("balance").value);

    // Basic validation
    if (!companyName || isNaN(balance) || balance < 0) {
      alert("Please enter a valid company name and a non-negative balance.");
      return;
    }

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "Company Name": companyName,
          Balance: balance
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert("Account created successfully!");
        // Optionally redirect to the login page or home page
        window.location.href = 'login.html'; // Redirect to login page
      } else {
        // Handle errors from the API
        alert(result.error || result.warning);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      alert("An error occurred while creating the account. Please try again.");
    }
  }