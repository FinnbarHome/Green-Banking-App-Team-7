function Levels()
{
	var power = 2.5;
	var denominator = 0.3;
	const levelBounds = [];

	for(let i = 0; i < 11; i++)
	{
		var bounds = i / denominator;
		bounds = Math.pow(xp, power);
		levelBounds[i] = bounds;
	}
	return levelBounds;
}

function getUserLevel(userXP) 
{
  const levelBounds = Levels();
  let level = 0;
  for (let i = 0; i < levelBounds.length; i++) {
    if (userXP >= levelBounds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

async function xp(accountNumber, transactionAmount) {
  try {
    // Fetch company data from the database
    const response = await fetch(`/api/companies/${accountNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company data');
    }

    const companyData = await response.json();

    // Extract values from companyData
    let {
      XP: userXP = 0,
      CarbonEmissions: CE = 0,
      WasteManagement: WM = 0,
      SustainabilityPractices: SP = 0,
      Streak: streak = 0
    } = companyData;

    var maxCatScore = 30;
    var greenMultiplier = 0;
    var redMultiplier = 0;
    var decreaseRed = 0;
  
    let categoryScore = CE + WM + SP;
    var envImpactScore = categoryScore / maxCatScore;

    // Determine if the current transaction is green or red
    let isGreenTransaction = envImpactScore > 0.7;
    let isRedTransaction = envImpactScore < 0.3;

    // Handle streak logic
    if (isGreenTransaction) {
      streak = streak < 0 ? 1 : streak + 1;
    } else if (isRedTransaction) {
      streak = streak > 0 ? -1 : streak - 1;
    } else {
      streak = 0;
    }

    let greenStreak = Math.max(0, streak);
    let redStreak = Math.abs(Math.min(0, streak));

    if (greenStreak % 5 === 0 && greenStreak > 0) {
      greenMultiplier = greenStreak / 5;
    }	
  
    if (redStreak % 5 === 0 && redStreak > 0) {
      redMultiplier = redStreak / 5;
    }
  
    if (greenMultiplier !== 0) {
      greenMultiplier *= 0.1;
      envImpactScore += greenMultiplier;
    }
    if (redMultiplier !== 0) {	
      decreaseRed = getUserLevel(userXP) / 2;
      redMultiplier *= 0.1 * decreaseRed;
      envImpactScore -= redMultiplier;
    }	
  
    var XPGain = Math.round(envImpactScore * transactionAmount);
    userXP += XPGain;
    let level = getUserLevel(userXP);

    // Update XP in the database
    const updateXPResponse = await fetch(`/api/companies/update-xp/${accountNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        xpAmount: XPGain
      })
    });

    if (!updateXPResponse.ok) {
      throw new Error('Failed to update XP');
    }

  
    const updateStreakResponse = await fetch(`/api/companies/update-streak/${accountNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        streak: streak
      })
    });

    if (!updateStreakResponse.ok) {
      throw new Error('Failed to update streak');
    }

    return {
      XPGain,
      userXP,
      newStreak: streak,
      level,
    };
  } catch (error) {
    console.error('Error in xp function:', error);
    throw error;
  }
}

/*function xp(userXP, transactionAmount, greenStreak, redStreak, CE, WM, SP) 
{


  var maxCatScore = 30;
  var greenMultiplier = 0;
  var redMultiplier = 0;
  var decreaseRed = 0;
  var categoryScore = 0;
  
  categoryScore = CE + WM + SP;
  var envImpactScore = categoryScore / maxCatScore;
  if (envImpactScore > 0.7) {
    greenStreak++;
  }
  
  if (envImpactScore < 0.3) {
    redStreak++;
  }
  
  if (greenStreak % 5 == 0) {
    greenMultiplier = greenStreak  / 5;
  }	
  
  if (redStreak % 5 == 0) {
    redMultiplier = redStreak / 5;
  }
  
  if (greenMultiplier != 0) {
    greenMultiplier *= 0.1;
    envImpactScore += greenMultiplier;
  }
  if (redMultiplier != 0) {	
    decreaseRed = userLevel / 2;
    redMultiplier *= 0.1 * decreaseRed;
    envImpactScore -= redMultiplier;
  }	
  
  var XPGain = envImpactScore * transactionAmount;
  userXP += XPGain;
  level = getUserLevel(userXP);

  //update database here
  
  return {
    XPGain: XPGain,
    userXP: userXP,
    newGreenStreak: greenStreak,
    newRedStreak: redStreak,
    appliedEIS: envImpactScore,
    level,
  };
}*/

async function greenAlternatives(spendingCategory) {
  try {
    // Fetch all companies from the database
    const response = await fetch('/api/companies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch companies data');
    }

    const companies = await response.json();

    // Filter companies by spending category and EIS, sort, and return top 3
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

// Helper function to calculate Environmental Impact Score (EIS)
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
    //update database

    return accountBalance;
  }