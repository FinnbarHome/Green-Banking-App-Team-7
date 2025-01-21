import CONFIG from "./config.js";

// Get the API backend base URL from the config file
const API_BASE_URL = CONFIG.API_BASE_URL;

// Add event listener to the "Sign Up" button
document
  .getElementById("signupButton")
  .addEventListener("click", createNewAccount);

// Function to create a new account
async function createNewAccount() {
  const companyName = document.getElementById("username").value;
  const balance = parseFloat(document.getElementById("balance").value);

  // Validate the account input
  if (!isValidInput(companyName, balance)) return;

  try {
    // Send a POST request to create a new account
    const response = await apiRequest("/companies", "POST", {
      "Company Name": companyName,
      Balance: balance,
    });

    // Handle successful account creation
    if (response) {
      const accountNumber = response["Account Number"];
      alert(
        `Account created successfully! Your new account number is: ${accountNumber}`
      );
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error creating account:", error);
    alert("An error occurred while creating the account. Please try again.");
  }
}

// Helper function to validate input
function isValidInput(companyName, balance) {
  if (!companyName || isNaN(balance) || balance < 0) {
    alert("Please enter a valid company name and a non-negative balance.");
    return false;
  }
  return true;
}

// General function to make API requests
async function apiRequest(endpoint, method = "GET", body = null) {
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
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || `Failed to ${method} at ${url}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Request Error: ${error.message}`);
    throw error;
  }
}
