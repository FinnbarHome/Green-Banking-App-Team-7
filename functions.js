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

function xp(categoryScore, userXP, transactionAmount, greenStreak, redStreak, userLevel, CE, WM, SP) 
{
  var maxCatScore = 30;
  var greenMultiplier = 0;
  var redMultiplier = 0;
  var decreaseRed = 0;
  
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
}

function greenAlternatives(companies) { 

    return companies 
  
      .filter(company => company.eis >= 0.7) 
  
      .sort((a, b) => b.eis - a.eis) 
  
      .slice(0, 3); 
  
  } 

  function transaction(transactionAmount, accountBalance)
  {
    accountBalance =- transactionAmount;
    //update database

    return accountBalance;
  }