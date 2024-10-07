document.getElementById("loginButton").addEventListener("click", handleLogin);

async function handleLogin() {
  const username = document.getElementById("username").value;
  const accountNumber = document.getElementById("accountNumber").value;
  const errorMessage = document.getElementById("errorMessage");

  clearErrorMessage(errorMessage);

  // Validate inputs
  if (!validateLoginInputs(username, accountNumber, errorMessage)) return;

  try {
    // Make the login request
    const response = await sendLoginRequest(username, accountNumber);

    if (response.ok) {
      // Store account number
      localStorage.setItem('accountNumber', response.data.accountNumber);

      // Redirect to account page
      window.location.href = 'home.html';
    } else {
      // Display error message on failure
      displayErrorMessage(errorMessage, response.data.error || "Login failed, check your username and account number");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    displayErrorMessage(errorMessage, "An error occurred during login, please try again.");
  }
}

// Clear error messages
function clearErrorMessage(errorMessageElement) {
  errorMessageElement.textContent = "";
}

// Validate login inputs
function validateLoginInputs(username, accountNumber, errorMessageElement) {
  if (!username) {
    displayErrorMessage(errorMessageElement, "Please enter a username");
    return false;
  }
  if (!accountNumber) {
    displayErrorMessage(errorMessageElement, "Please enter an Account Number");
    return false;
  }
  return true;
}

// Display error messages
function displayErrorMessage(errorMessageElement, message) {
  errorMessageElement.textContent = message;
}

// Send login request
async function sendLoginRequest(username, accountNumber) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, accountNumber })
  });

  const data = await response.json();
  return { ok: response.ok, data };
}
