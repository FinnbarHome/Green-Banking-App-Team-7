// Calculates the level boundaries
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

// Calculates the user's current level via XP
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

  // Return the data
  return {
    level: level,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    currentXP: userXP,
    nextLevelXP: NextLevel
  };
}

// Calculates the XP based on the transaction amount
export async function xp(accountNumber, transactionAmount) {
  try {
    const response = await fetch(`/api/companies/${accountNumber}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company data');
    }

    const companyData = await response.json();

    let {
      XP: userXP = 0,
      CarbonEmissions: CE = 0,
      WasteManagement: WM = 0,
      SustainabilityPractices: SP = 0,
    } = companyData;

    const maxCatScore = 30;
    const greenThreshold = 0.7;
    const redThreshold = 0.3;

    let categoryScore = CE + WM + SP;
    let envImpactScore = categoryScore / maxCatScore;

    let XPGain = Math.round(envImpactScore * transactionAmount);
    userXP += XPGain;

    const updateXPResponse = await fetch(`/api/companies/update-xp/${accountNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xpAmount: XPGain })
    });

    if (!updateXPResponse.ok) {
      throw new Error('Failed to update XP');
    }

    let levelInfo = calculateUserLevel(userXP);

    return {
      XPGain,
      userXP,
      level: levelInfo.level,
      progressPercentage: levelInfo.progressPercentage
    };
  } catch (error) {
    console.error('Error in xp function:', error);
    throw error;
  }
}

// Calculates the green alternative companies
async function greenAlternatives(spendingCategory) {
  try {
    const response = await fetch('/api/companies', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch companies data');
    }

    const companies = await response.json();

    return companies
      .filter(company => 
        company.SpendingCategory === spendingCategory && 
        calculateEIS(company) >= 0.7
      )
      .sort((a, b) => calculateEIS(b) - calculateEIS(a))
      .slice(0, 3);
  } catch (error) {
    console.error('Error in greenAlternatives function:', error);
    throw error;
  }
}

// Calculates the EIS of a company
function calculateEIS(company) {
  const maxCatScore = 30;
  const categoryScore = (company.CarbonEmissions || 0) + 
                        (company.WasteManagement || 0) + 
                        (company.SustainabilityPractices || 0);
  return categoryScore / maxCatScore;
}
  function transaction(transactionAmount, accountBalance)
  {
    accountBalance =- transactionAmount;

    return accountBalance;
  }

  module.exports = { xp };