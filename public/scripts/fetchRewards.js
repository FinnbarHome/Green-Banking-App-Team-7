// Calculates the user's current level via XP
function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0, PreviousLevelXP = 0, NextLevelXP = 0;

  for (let i = 0; i < levelBounds.length; i++) {
    if (userXP >= levelBounds[i]) {
      level = i + 1;
      PreviousLevelXP = levelBounds[i];
      NextLevelXP = (i + 1 < levelBounds.length) ? levelBounds[i + 1] : levelBounds[i];
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

  // Return the data
  return {
    level,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    currentXP: userXP,
    nextLevelXP:
 NextLevelXP
  };
}

// Calculates the level boundaries
function Levels() {
  const power = 2.5, denominator = 0.3, levelBounds = [];
  for (let i = 0; i < 10; i++) {
    levelBounds[i] = Math.round(Math.pow(i / denominator, power));
  }
  return levelBounds;
}

async function fetchRewardsData() {
    try {
  
      // Fetch account number
      const accountNumber = localStorage.getItem('accountNumber');
  
      if (!accountNumber) {
        console.error('No account number found in localStorage.');
        return;
      }
  
      // Fetch the account data via account number
      const response = await fetch(`/api/companies/${accountNumber}`);
      const companyData = await response.json();
  
      if (!response.ok) {
        console.error("Error fetching company data:", companyData.error);
        return;
      }

      const { "Company Name": companyName, XP: userXP } = companyData;
      
      // Calculate and fetch the user's level
      const userLevel = calculateUserLevel(userXP);
      document.getElementById('greenLevel').textContent = userLevel["level"]; // Set the green level in the UI
2
      // Update the html
      document.getElementById('username').textContent = companyName;
      document.getElementById('xp').textContent = userXP;
      
      // Fetch all discounts
      const discountResponse = await fetch('/api/discounts');
      const discounts = await discountResponse.json();
  
      // Set the availabke discounts, based on user's level
      const eligibleDiscounts = discounts.filter(discount => userLevel["level"] >= discount.LevelReq);
  
      const rewardsContainer = document.getElementById('rewardsContainer');
      const noRewardsElement = document.getElementById('noRewards');
  
      // If no eligible rewards are found
      if (eligibleDiscounts.length === 0) {
        noRewardsElement.innerHTML = 'You have <span class="text-orange-500">no new rewards</span> to redeem.';
        rewardsContainer.style.display = 'none'; // Hide the rewards section if no rewards are available
        return;
      }
  
      // Clear the html
      rewardsContainer.innerHTML = '<h2 class="text-xl font-bold text-white text-center mb-4">You earned some <span class="text-orange-500">discounts!</span></h2>';
  
      // Add each discount html
      eligibleDiscounts.forEach(discount => {
        const rewardElement = `
          <div class="grid grid-flow-col mb-4">
            <h2 class="bg-green-900 text-xl font-bold text-white px-5 rounded-l-lg py-4">${discount.Company}</h2>
            <h2 class="row-start-1 text-xl text-white text-right px-5 py-4 rounded-r-lg bg-green-900">${discount.Description}</h2>
          </div>
        `;
        rewardsContainer.insertAdjacentHTML('beforeend', rewardElement);
      });
  
      // Display the rewards section
      rewardsContainer.style.display = 'block';
      noRewardsElement.textContent = ''; // Clear any "no rewards" message
  
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    }
  }
  
  // Fetch rewards data upon page load
  window.onload = fetchRewardsData;
  