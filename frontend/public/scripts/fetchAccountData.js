import CONFIG from "./config.js";

// Get the API backend base URL from the config file
const API_BASE_URL = CONFIG.API_BASE_URL;

// Remove '/api' from the end and assign to a new variable (for ws)
const BASE_URL = API_BASE_URL.replace(/\/api$/, "");

// Remove protocol from BASE_URL and prepend 'ws://'
const wsUrl = `ws://${BASE_URL.split("//")[1]}`;

let ws;

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

// WebSocket initialization
function initializeWebSocket(accountNumber) {
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connection opened");
    ws.send(JSON.stringify({ type: "register", accountNumber }));
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "transactionUpdate") {
      fetchAccountData(); // Refresh account data on transaction updates
    }
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

// Fetch account data and update the page
async function fetchAccountData() {
  try {
    const accountNumber = localStorage.getItem("accountNumber");
    if (!accountNumber) throw new Error("No account number found");

    const companyData = await apiRequest(`/companies/${accountNumber}`);
    if (!companyData) return;

    const XP = companyData.XP;
    const levelInfo = calculateUserLevel(XP);

    updateDOM({
      Username: `Username: ${companyData["Company Name"]}`,
      AccountNumber: `Account Number: ${companyData["Account Number"]}`,
      Balance: `Balance: £${companyData.Balance.toFixed(2)}`,
      Level: `Level: ${levelInfo.level}`,
      XP: `XP: ${XP}`,
    });

    await fetchTransactionHistory(accountNumber); // Fetch transaction history
    initializeWebSocket(accountNumber); // Initialize WebSocket for live updates
  } catch (error) {
    console.error("Error fetching account data:", error);
  }
}

// Fetch transaction history
async function fetchTransactionHistory(accountNumber) {
  try {
    const transactions = await apiRequest(`/transactions/${accountNumber}`);
    if (!transactions) return;

    clearAndInsertHTML("pastPayments", transactionHeaderHTML());
    const companyCache = {};

    for (const transaction of transactions) {
      const { isOutgoing, amount, transactionDate, companyName, bgColor } =
        await prepareTransactionData(transaction, accountNumber, companyCache);
      insertTransactionElement(
        isOutgoing,
        amount,
        transactionDate,
        companyName,
        bgColor
      );
    }
  } catch (error) {
    console.error("Error fetching transaction history:", error);
  }
}

// Prepare transaction data for rendering
async function prepareTransactionData(
  transaction,
  accountNumber,
  companyCache
) {
  const isOutgoing = transaction.Sender === parseInt(accountNumber);
  const amount = isOutgoing ? -transaction.Amount : transaction.Amount;
  const transactionDate = new Date(transaction.date).toLocaleDateString();
  const transactedWithCompanyId = isOutgoing
    ? transaction.Recipient
    : transaction.Sender;

  if (!companyCache[transactedWithCompanyId]) {
    companyCache[transactedWithCompanyId] = await apiRequest(
      `/companies/${transactedWithCompanyId}`
    );
  }

  const transactedWithCompany = companyCache[transactedWithCompanyId] || {};
  const companyName =
    transactedWithCompany["Company Name"] || transactedWithCompanyId;
  const bgColor = getBgColor(transactedWithCompany);

  return { isOutgoing, amount, transactionDate, companyName, bgColor };
}

// Helper functions for transaction rendering
const transactionHeaderHTML = () =>
  `<div class="grid grid-cols-3 gap-4 mb-2 font-bold text-lg bg-gray-800 text-white px-5 py-2 rounded-lg">
        <h2 class="text-center">Company</h2>
        <h2 class="text-right">Amount</h2>
        <h2 class="text-right">Date</h2>
    </div>`;

function insertTransactionElement(
  isOutgoing,
  amount,
  transactionDate,
  companyName,
  bgColor
) {
  const transactionHTML = `
        <a href="analysis.html?companyName=${encodeURIComponent(companyName)}">
            <div class="grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 class="col-span-1 ${bgColor} text-xl font-bold text-center text-white rounded-lg py-2">${companyName}</h2>
                <h2 class="col-span-1 text-xl text-right ${
                  isOutgoing ? "text-red-400" : "text-green-400"
                }">
                    ${isOutgoing ? "-" : "+"} £${Math.abs(amount).toFixed(2)}
                </h2>
                <h2 class="col-span-1 text-sm text-gray-400 text-right">${transactionDate}</h2>
            </div>
        </a>`;
  document
    .getElementById("pastPayments")
    .insertAdjacentHTML("beforeend", transactionHTML);
}

// Helper functions for updating the DOM
function updateDOM(updates) {
  Object.entries(updates).forEach(([id, text]) => {
    document.getElementById(id).textContent = text;
  });
}

function clearAndInsertHTML(elementId, html) {
  document.getElementById(elementId).innerHTML = html;
}

// Calculate user levels and XP
function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0;
  let nextLevelXP = 0;
  let progressPercentage = 0;

  for (let i = 0; i < levelBounds.length; i++) {
    if (userXP >= levelBounds[i]) {
      level = i + 1;
      if (i + 1 < levelBounds.length) nextLevelXP = levelBounds[i + 1];
    } else {
      nextLevelXP = levelBounds[i];
      break;
    }
  }

  progressPercentage =
    ((userXP - levelBounds[level - 1]) /
      (nextLevelXP - levelBounds[level - 1])) *
    100;

  return {
    level,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    currentXP: userXP,
    nextLevelXP,
  };
}

function Levels() {
  const power = 2.5;
  const denominator = 0.3;
  const levelBounds = [];
  for (let i = 0; i < 11; i++) {
    levelBounds.push(Math.round(Math.pow(i / denominator, power)));
  }
  return levelBounds;
}

// Calculate the background color for a transaction
function getBgColor(companyData) {
  const maxCatScore = 30; // Maximum score for environmental categories
  const carbonEmissions = companyData["Carbon Emissions"] || 0;
  const wasteManagement = companyData["Waste Management"] || 0;
  const sustainabilityPractices = companyData["Sustainability Practices"] || 0;

  const totalScore =
    carbonEmissions + wasteManagement + sustainabilityPractices;
  const normalizedScore = totalScore / maxCatScore;

  // Determine the color based on the normalized score
  if (normalizedScore >= 0.7) {
    return "bg-green-900"; // Green for high sustainability
  } else if (normalizedScore >= 0.3) {
    return "bg-orange-900"; // Orange for medium sustainability
  } else {
    return "bg-red-900"; // Red for low sustainability
  }
}

// Trigger fetchAccountData on page load
window.onload = fetchAccountData;
