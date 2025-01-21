// Calculates the user's current level via XP
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

  // Return the data
  return {
    level,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    currentXP: userXP,
    nextLevelXP: NextLevelXP,
  };
}

// Calculates the level boundaries
function Levels() {
  const power = 2.5,
    denominator = 0.3,
    levelBounds = [];
  for (let i = 0; i < 10; i++) {
    levelBounds[i] = Math.round(Math.pow(i / denominator, power));
  }
  return levelBounds;
}
