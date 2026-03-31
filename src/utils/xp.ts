import { XP_PER_LEVEL } from '../shared/constants';

export interface LevelProgress {
  level: number;
  currentXpInLevel: number;
  xpForNextLevel: number;
}

export function getXpRequiredForNextLevel(level: number) {
  return level > 0 ? XP_PER_LEVEL : 0;
}

export function calculateLevelProgress(totalXp: number): LevelProgress {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);
  let threshold = getXpRequiredForNextLevel(level);

  while (remainingXp >= threshold) {
    remainingXp -= threshold;
    level += 1;
    threshold = getXpRequiredForNextLevel(level);
  }

  return {
    level,
    currentXpInLevel: remainingXp,
    xpForNextLevel: threshold,
  };
}

export function calculateProgressPercent(totalXp: number) {
  const progress = calculateLevelProgress(totalXp);

  if (progress.xpForNextLevel <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((progress.currentXpInLevel / progress.xpForNextLevel) * 100),
  );
}
