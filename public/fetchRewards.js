function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0;
  let NextLevel = 0;
  let PreviousLevel = 0;

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

  return {
    level: level,
    currentXP: userXP,
  };
}

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

async function fetchRewardsData() {
    try {
  
      // Get account number from localStorage
      const accountNumber = localStorage.getItem('accountNumber');
  
      if (!accountNumber) {
        console.error('No account number found in localStorage.');
        return;
      }
  
      // Fetch the company data using the account number
      const response = await fetch(`/api/companies/${accountNumber}`);
      const companyData = await response.json();
  
      if (!response.ok) {
        console.error("Error fetching company data:", companyData.error);
        return;
      }
  
      // Extract user data from the response
      const { "Company Name": companyName, XP: userXP } = companyData;
      
      const userLevel = calculateUserLevel(userXP);
      // Manually set the user's green level
      document.getElementById('greenLevel').textContent = userLevel["level"]; // Set the green level in the UI
2
      // Display user information in the HTML
      document.getElementById('username').textContent = companyName;
      document.getElementById('xp').textContent = userXP;
      
  
      // Fetching discounts from the backend
      const discountResponse = await fetch('/api/discounts');
      const discounts = await discountResponse.json();
  
      // Filtering discounts based on manually set userLevel
      const eligibleDiscounts = discounts.filter(discount => userLevel["level"] >= discount.LevelReq);
  
      const rewardsContainer = document.getElementById('rewardsContainer');
      const noRewardsElement = document.getElementById('noRewards');
  
      // If no eligible rewards are found
      if (eligibleDiscounts.length === 0) {
        noRewardsElement.innerHTML = 'You have <span class="text-orange-500">no new rewards</span> to redeem.';
        rewardsContainer.style.display = 'none'; // Hide the rewards section if no rewards are available
        return;
      }
  
      // Clear any existing rewards
      rewardsContainer.innerHTML = '<h2 class="text-xl font-bold text-white text-center mb-4">You earned some <span class="text-orange-500">discounts!</span></h2>';
  
      // Dynamically add the rewards based on the user's level
      eligibleDiscounts.forEach(discount => {
        const rewardElement = `
          <div class="grid grid-flow-col mb-4">
            <h2 class="bg-green-900 text-xl font-bold text-white px-5 rounded-l-lg py-4">${discount.Company}</h2>
            <h2 class="row-start-1 text-xl text-white text-right px-5 py-4 rounded-r-lg bg-green-900">${discount.Description}</h2>
          </div>
        `;
        rewardsContainer.insertAdjacentHTML('beforeend', rewardElement);
      });
  
      // Show the rewards section
      rewardsContainer.style.display = 'block';
      noRewardsElement.textContent = ''; // Clear any "no rewards" message
  
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    }
  }
  
  // Fetch rewards data when the page loads
  window.onload = fetchRewardsData;
  