document.getElementById("loginButton").addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const errorMessage = document.getElementById("errorMessage");

    // Clear previous error messages
    errorMessage.textContent = "";

    // Check if username is entered
    if (!username) {
      errorMessage.textContent = "Please enter a username.";
      return;
    }

    try {
      // Make the POST request to the login API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
      });

      const data = await response.json();

      // If login is successful, store account number and redirect to another page
      if (response.ok) {
        const accountNumber = data.accountNumber;
        localStorage.setItem('accountNumber', accountNumber); // Store account number in localStorage
        console.log("Stored account number: ", accountNumber);
        window.location.href = `home.html`; // Redirect to another page, e.g., dashboard
      } else {
        // Show error message if login fails
        errorMessage.textContent = data.error || "Login failed. Please try again.";
      }
    } catch (error) {
      console.error("Error logging in:", error);
      errorMessage.textContent = "An error occurred during login. Please try again.";
    }
  });