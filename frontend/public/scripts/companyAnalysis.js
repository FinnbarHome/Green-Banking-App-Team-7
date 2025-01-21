// Base URL for API requests
const API_BASE_URL = "http://localhost:3000/api"; // Backend server URL

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
      throw new Error(`Error fetching ${endpoint}: ${error}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Request Error: ${error.message}`);
    throw error;
  }
}

// Fetch company data and update the page
async function fetchCompanyData() {
  try {
    const companyName = getCompanyNameFromUrl(); // Extract company name from URL
    const companyData = await apiRequest(
      `/companies/name/${encodeURIComponent(companyName)}`
    );

    // Update the elements with the fetched data
    document.getElementById("companyName").textContent =
      companyData["Company Name"];
    document.getElementById("transactionType").textContent =
      companyData["Spending Category"];
    document.getElementById("carbEmissions").textContent =
      companyData["Carbon Emissions"];
    document.getElementById("wasteManagement").textContent =
      companyData["Waste Management"];
    document.getElementById("sustainPractices").textContent =
      companyData["Sustainability Practices"];

    // Calculate and display the Environmental Impact Score (EIS)
    const eiScore = calculateEIS(companyData);
    document.getElementById("eiScore").textContent = eiScore.toFixed(2);

    // Calculate and display the RAG rating
    getRagRating(eiScore);

    // Fetch and display greener alternatives
    greenAlternatives(
      companyData["Company Name"],
      companyData["Spending Category"],
      eiScore
    );
  } catch (error) {
    console.error("Error fetching company data:", error);
  }
}

// Get RAG rating from EIS
function getRagRating(eiScore) {
  const ragRatingElement = document.getElementById("ragRating");

  // Update text and style based on RAG rating
  if (eiScore <= 3) {
    ragRatingElement.textContent = "Red";
    ragRatingElement.classList.add("text-red-400");
  } else if (eiScore <= 7) {
    ragRatingElement.textContent = "Amber";
    ragRatingElement.classList.add("text-orange-500");
  } else {
    ragRatingElement.textContent = "Green";
    ragRatingElement.classList.add("text-green-400");
  }
}

// Extract company name from URL parameters
function getCompanyNameFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("companyName");
}

// Fetch and display greener alternatives
async function greenAlternatives(companyName, spendingCategory, companyEIS) {
  try {
    const companies = await apiRequest("/companies"); // Fetch all companies

    const greenCompanies = companies
      .filter((company) => {
        const category = company["Spending Category"] || "";
        const eis = calculateEIS(company);

        return (
          category.toLowerCase() === spendingCategory.toLowerCase() &&
          eis >= 7 &&
          company["Company Name"] !== companyName &&
          eis >= companyEIS
        );
      })
      .sort((a, b) => calculateEIS(b) - calculateEIS(a))
      .slice(0, 3);

    console.log("Green Companies:", greenCompanies);

    // Display the greener alternatives
    displayGreenAlternatives(greenCompanies);
  } catch (error) {
    console.error("Error in greenAlternatives function:", error);
  }
}

// Calculate the Environmental Impact Score (EIS)
function calculateEIS(company) {
  const carbonEmissions = company["Carbon Emissions"] || 0;
  const wasteManagement = company["Waste Management"] || 0;
  const sustainabilityPractices = company["Sustainability Practices"] || 0;

  // Calculate the average EIS
  return (carbonEmissions + wasteManagement + sustainabilityPractices) / 3;
}

// Display the green alternative companies
function displayGreenAlternatives(greenCompanies) {
  const alternativesContainer = document.getElementById("alternatives");
  alternativesContainer.innerHTML = "";

  if (greenCompanies.length === 0) {
    // Display a message if no greener alternatives are found
    alternativesContainer.textContent =
      "No green alternative companies available";
    alternativesContainer.classList.add(
      "text-red-400",
      "font-bold",
      "text-center",
      "text-xl"
    );
    return;
  }

  // Create elements for each green company
  greenCompanies.forEach((company) => {
    const companyElement = document.createElement("div");
    companyElement.classList.add(
      "bg-gray-700",
      "p-4",
      "rounded-lg",
      "shadow-md",
      "mb-4"
    );
    companyElement.innerHTML = `
            <h3 class="text-xl font-bold text-green-400">${
              company["Company Name"]
            }</h3>
            <p class="text-white">Environmental Impact Score: ${calculateEIS(
              company
            ).toFixed(2)}</p>
        `;
    alternativesContainer.appendChild(companyElement);
  });
}

// Trigger fetchCompanyData on page load
window.onload = fetchCompanyData;
