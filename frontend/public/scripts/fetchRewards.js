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

// Fetch rewards data and update the UI
async function fetchRewardsData() {
  try {
    const accountNumber = localStorage.getItem("accountNumber");
    if (!accountNumber) {
      console.error("No account number found");
      return;
    }

    // Fetch account data using the account number
    const companyData = await apiRequest(`/companies/${accountNumber}`);
    const { "Company Name": companyName, XP: userXP } = companyData;

    // Calculate the user's level
    const userLevel = calculateUserLevel(userXP);
    document.getElementById("greenLevel").textContent = userLevel.level;

    // Update the user information in the UI
    document.getElementById("username").textContent = companyName;
    document.getElementById("xp").textContent = userXP;

    // Fetch all available discounts
    const discounts = await apiRequest("/discounts");

    // Filter discounts based on user's level
    const eligibleDiscounts = discounts.filter(
      (discount) => userLevel.level >= discount.LevelReq
    );

    const rewardsContainer = document.getElementById("rewardsContainer");
    const noRewardsElement = document.getElementById("noRewards");

    // Handle no rewards scenario
    if (eligibleDiscounts.length === 0) {
      noRewardsElement.innerHTML =
        'You have <span class="text-orange-500">no new rewards</span> to redeem.';
      rewardsContainer.style.display = "none";
      return;
    }

    // Clear the rewards container and add eligible rewards
    rewardsContainer.innerHTML =
      '<h2 class="text-xl font-bold text-white text-center mb-4">You earned some <span class="text-orange-500">discounts!</span></h2>';
    eligibleDiscounts.forEach((discount) => {
      const rewardElement = `
                <div class="grid grid-flow-col mb-4">
                    <h2 class="bg-green-900 text-xl font-bold text-white px-5 rounded-l-lg py-4">${discount.Company}</h2>
                    <h2 class="row-start-1 text-xl text-white text-right px-5 py-4 rounded-r-lg bg-green-900">${discount.Description}</h2>
                </div>
            `;
      rewardsContainer.insertAdjacentHTML("beforeend", rewardElement);
    });

    // Show the rewards section
    rewardsContainer.style.display = "block";
    noRewardsElement.textContent = "";
  } catch (error) {
    console.error("Error fetching rewards data:", error);
  }
}

// Calculate the user's current level via XP
function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0,
    PreviousLevelXP = 0,
    NextLevelXP = 0;

  for (let i = 0; i < levelBounds.length; i++) {
    if (userXP >= levelBounds[i]) {
      level = i + 1;
      PreviousLevelXP = levelBounds[i];
      NextLevelXP =
        i + 1 < levelBounds.length ? levelBounds[i + 1] : levelBounds[i];
    } else {
      NextLevelXP = levelBounds[i];
      break;
    }
  }

  level = Math.min(level, 10);

  // Calculate the progress percentage
  let progressPercentage;
  if (level === 10) {
    const maxXP = levelBounds[levelBounds.length - 1];
    const level9XP = levelBounds[levelBounds.length - 2];
    const xpAboveLevel9 = Math.min(userXP, maxXP) - level9XP;
    const xpForLevel10 = maxXP - level9XP;
    progressPercentage = (xpAboveLevel9 / xpForLevel10) * 100;
  } else {
    const xpForNextLevel = NextLevelXP - PreviousLevelXP;
    const xpProgress = userXP - PreviousLevelXP;
    progressPercentage = (xpProgress / xpForNextLevel) * 100;
  }

  progressPercentage = Math.min(progressPercentage, 100);

  // Return the level and XP progress data
  return {
    level,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    currentXP: userXP,
    nextLevelXP: NextLevelXP,
  };
}

// Calculate the level boundaries
function Levels() {
  const power = 2.5,
    denominator = 0.3,
    levelBounds = [];
  for (let i = 0; i < 10; i++) {
    levelBounds[i] = Math.round(Math.pow(i / denominator, power));
  }
  return levelBounds;
}

// Fetch rewards data upon page load
window.onload = fetchRewardsData;
