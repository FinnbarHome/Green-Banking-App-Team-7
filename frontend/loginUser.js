document.getElementById("loginButton").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const accountNumber = document.getElementById("accountNumber").value;
  const errorMessage = document.getElementById("errorMessage");

  // Clear previous error messages
  errorMessage.textContent = "";

  // Check if both username and account number are entered
  if (!username) {
    errorMessage.textContent = "Please enter a username.";
    return;
  }

  if (!accountNumber) {
    errorMessage.textContent = "Please enter an Account Number.";
    return;
  }

  try {
    // Make the POST request to the login API with both username and accountNumber
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, accountNumber: accountNumber }) // Send both fields
    });

    const data = await response.json();

    // If login is successful, store account number and redirect to another page
    if (response.ok) {
      localStorage.setItem('accountNumber', data.accountNumber); // Store account number in localStorage
      console.log("Stored account number: ", data.accountNumber);
      window.location.href = `home.html`; // Redirect to another page
    } else {
      // Show error message if login fails
      errorMessage.textContent = data.error || "Login failed. Please check your username and account number.";
    }
  } catch (error) {
    console.error("Error logging in:", error);
    errorMessage.textContent = "An error occurred during login. Please try again.";
  }
});
