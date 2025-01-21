import CONFIG from "./config.js";

// Get the API backend base URL from the config file
const API_BASE_URL = CONFIG.API_BASE_URL;

// General function to make API requests and handle errors
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
      throw new Error(`Error fetching ${endpoint}: ${error}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Request Error: ${error.message}`);
    return null;
  }
}

// Add "admin.html" link if the user is an admin
async function checkAdminStatus() {
  // Get the account number from localStorage
  const accountNumber = localStorage.getItem("accountNumber");
  if (!accountNumber) return; // Exit if no account number is found

  try {
    // Fetch company details via account number
    const companyData = await apiRequest(`/companies/${accountNumber}`, "GET");
    if (!companyData) return;

    // Check if the Spending Category is not "User"
    if (companyData["Spending Category"] !== "User") {
      const currentPage = window.location.pathname.split("/").pop();
      const mobileMenu = document.getElementById("mobileMenu");

      // Check if the "Admin" link is already there
      let mobileAdminLink = mobileMenu.querySelector('a[href="admin.html"]');

      if (!mobileAdminLink) {
        // Create a new "admin.html" link if it's not there already
        mobileAdminLink = document.createElement("a");
        mobileAdminLink.href = "admin.html";
        mobileAdminLink.classList =
          "block px-3 py-2 text-gray-400 hover:bg-green-700 hover:text-white";
        mobileAdminLink.textContent = "Admin";

        // Insert the admin button before the "Sign Out" button
        mobileMenu.insertBefore(
          mobileAdminLink,
          mobileMenu.querySelector('a[href="login.html"]')
        );
      }

      // Highlight the "Admin" link in the mobile menu
      if (currentPage === "admin.html") {
        mobileAdminLink.classList.remove("text-gray-400");
        mobileAdminLink.classList.add("bg-black", "text-white");
      }
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
  }
}

checkAdminStatus();
