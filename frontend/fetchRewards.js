async function fetchRewardsData() {
    try {
      // Simulating fetching user level and XP from the server/local storage
      const userLevel = 10; // This should be fetched dynamically from user's data
      const username = "John Doe"; // This should be fetched dynamically from user's data
      const xp = 1200; // This should be fetched dynamically from user's data
  
      // Display user info on the page
      document.getElementById('username').textContent = username;
      document.getElementById('greenLevel').textContent = userLevel;
      document.getElementById('xp').textContent = xp;
  
      // Fetching discounts from the backend
      const response = await fetch('/api/discounts');
      const discounts = await response.json();
  
      // Filtering discounts based on user's level
      const eligibleDiscounts = discounts.filter(discount => userLevel >= discount.LevelReq);
  
      const rewardsContainer = document.getElementById('rewardsContainer');
      const noRewardsElement = document.getElementById('noRewards');
  
      // If no eligible rewards are found
      if (eligibleDiscounts.length === 0) {
        noRewardsElement.innerHTML = 'You have <span class="text-orange-500">no new rewards</span> to redeem.';
        rewardsContainer.style.display = 'none'; // Hide the rewards section if no rewards are available
        return;
      }
  
      // Clear any existing rewards
      rewardsContainer.innerHTML = '';
  
      // Dynamically add the rewards based on the user's level
      eligibleDiscounts.forEach(discount => {
        const rewardElement = `
          <div class="grid grid-flow-col gap-1 mb-4">
            <h2 class="bg-green-900 text-xl font-bold text-white px-5 rounded-l-lg py-4">${discount.Company}</h2>
            <h2 class="row-start-1 text-xl text-white text-right px-5 py-4 rounded-r-lg bg-green-800 text-red-400">${discount.Description}</h2>
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
  