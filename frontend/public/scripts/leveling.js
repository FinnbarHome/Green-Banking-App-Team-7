import CONFIG from "./config.js";

// Get the API backend base URL from the config file
const API_BASE_URL = CONFIG.API_BASE_URL;

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

// Calculate level boundaries
function Levels() {
  const power = 2.5;
  const denominator = 0.3;
  const levelBounds = [];

  for (let i = 0; i < 11; i++) {
    let bounds = i / denominator;
    bounds = Math.pow(bounds, power);
    levelBounds[i] = Math.round(bounds);
  }
  return levelBounds;
}

// Calculate the user's current level via XP
function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0;
  let NextLevel = 0;
  let PreviousLevel = 0;
  let progressPercentage = 0;

  for (let i = 0; i < levelBounds.length; i++) {
    if (userXP >= levelBounds[i]) {
      level = i + 1;
      PreviousLevel = levelBounds[i];
      if (i + 1 < levelBounds.length) {
        NextLevel = levelBounds[i + 1];
      } else {
        NextLevel = levelBounds[i];
      }
    } else {
      NextLevel = levelBounds[i];
      break;
    }
  }

  // Calculate the progress percentage
  if (level < levelBounds.length) {
    let xpForNextLevel = NextLevel - PreviousLevel;
    let currentLevelProgress = userXP - PreviousLevel;
    progressPercentage = (currentLevelProgress / xpForNextLevel) * 100;
  } else {
    progressPercentage = 100;
  }

  return {
    level: level,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    currentXP: userXP,
    nextLevelXP: NextLevel,
  };
}

// Calculate XP and update account
export async function xp(accountNumber, transactionAmount) {
  try {
    // Fetch account data from the backend
    const companyData = await apiRequest(`/companies/${accountNumber}`, "GET");
    let {
      XP: userXP = 0,
      CarbonEmissions: CE = 0,
      WasteManagement: WM = 0,
      SustainabilityPractices: SP = 0,
    } = companyData;

    // Calculate environmental impact score (EIS)
    const maxCatScore = 30;
    const categoryScore = CE + WM + SP;
    const envImpactScore = categoryScore / maxCatScore;

    // Calculate XP gain based on the transaction amount and EIS
    const XPGain = Math.round(envImpactScore * transactionAmount);
    userXP += XPGain;

    // Update the user's XP in the backend
    await apiRequest(`/companies/update-xp/${accountNumber}`, "PUT", {
      xpAmount: XPGain,
    });

    // Calculate the updated level information
    const levelInfo = calculateUserLevel(userXP);

    return {
      XPGain,
      userXP,
      level: levelInfo.level,
      progressPercentage: levelInfo.progressPercentage,
    };
  } catch (error) {
    console.error("Error in XP function:", error);
    throw error;
  }
}

// Calculate green alternative companies
export async function greenAlternatives(spendingCategory) {
  try {
    const companies = await apiRequest("/companies", "GET");

    return companies
      .filter(
        (company) =>
          company.SpendingCategory === spendingCategory &&
          calculateEIS(company) >= 0.7
      )
      .sort((a, b) => calculateEIS(b) - calculateEIS(a))
      .slice(0, 3);
  } catch (error) {
    console.error("Error in greenAlternatives function:", error);
    throw error;
  }
}

// Calculate the Environmental Impact Score (EIS) for a company
function calculateEIS(company) {
  const maxCatScore = 30;
  const categoryScore =
    (company.CarbonEmissions || 0) +
    (company.WasteManagement || 0) +
    (company.SustainabilityPractices || 0);
  return categoryScore / maxCatScore;
}

// Simulate a transaction by deducting amount from balance
export function transaction(transactionAmount, accountBalance) {
  accountBalance -= transactionAmount;
  return accountBalance;
}

export default { xp, greenAlternatives };
