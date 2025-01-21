import CONFIG from "./config.js";

// Get the API backend base URL from the config file
const API_BASE_URL = CONFIG.API_BASE_URL;

// Add event listener for login button
document.getElementById("loginButton").addEventListener("click", handleLogin);

// General function to make API requests
async function apiRequest(endpoint, method = "POST", body = null) {
  const url = `${API_BASE_URL}${endpoint}`; // Construct full URL
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error(`API Request Error: ${error.message}`);
    throw error;
  }
}

// Handle user login
async function handleLogin() {
  const username = document.getElementById("username").value;
  const accountNumber = document.getElementById("accountNumber").value;
  const errorMessage = document.getElementById("errorMessage");

  clearErrorMessage(errorMessage);

  // Validate inputs
  if (!validateLoginInputs(username, accountNumber, errorMessage)) return;

  try {
    // Send login request to backend
    const response = await apiRequest("/login", "POST", {
      username,
      accountNumber,
    });

    if (response.ok) {
      // Store account number in local storage
      localStorage.setItem("accountNumber", response.data.accountNumber);

      // Redirect to the home page
      window.location.href = "home.html";
    } else {
      // Display error message on login failure
      displayErrorMessage(
        errorMessage,
        response.data.error ||
          "Login failed, check your username and account number"
      );
    }
  } catch (error) {
    console.error("Error logging in:", error);
    displayErrorMessage(
      errorMessage,
      "An error occurred during login, please try again."
    );
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
