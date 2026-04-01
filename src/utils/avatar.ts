import {
  AVATAR_EYE_COLOR_OPTIONS,
  AVATAR_HAIR_COLOR_OPTIONS,
  AVATAR_SKIN_TONE_OPTIONS,
  DASHBOARD_STAT_COLORS,
} from '../shared/avatarConfig';
import type {
  AvatarFormValues,
  AvatarProfile,
  CompletionLog,
  Quest,
  Stat,
  StatKey,
} from '../types/domain';
import { createId } from './id';
import { calculateQuestStreak } from './streaks';

export function buildAvatarProfile(
  values: AvatarFormValues,
  currentAvatar?: AvatarProfile | null,
): AvatarProfile {
  const nowIso = new Date().toISOString();

  return {
    id: currentAvatar?.id ?? createId(),
    ...values,
    createdAt: currentAvatar?.createdAt ?? nowIso,
    updatedAt: nowIso,
  };
}

export function getAvatarStage(level: number) {
  if (level >= 20) {
    return 3;
  }

  if (level >= 10) {
    return 2;
  }

  if (level >= 5) {
    return 1;
  }

  return 0;
}

export function getAvatarStages(stats: Stat[]) {
  const stages = {
    health: 0,
    discipline: 0,
    order: 0,
    finance: 0,
    socialization: 0,
  };

  stats.forEach((stat) => {
    if (stat.key in stages) {
      stages[stat.key as keyof typeof stages] = getAvatarStage(stat.level);
    }
  });

  return stages;
}

export function getDominantStatKey(stats: Stat[]): StatKey {
  if (stats.length === 0) {
    return 'discipline';
  }

  return [...stats].sort((left, right) => {
    if (right.level !== left.level) {
      return right.level - left.level;
    }

    return right.xp - left.xp;
  })[0].key;
}

export function getDashboardBackgroundTheme(
  stats: Stat[],
  quests: Quest[],
  logs: CompletionLog[],
) {
  const dominantStatKey = getDominantStatKey(stats);
  const dominantTheme =
    DASHBOARD_STAT_COLORS[dominantStatKey] ?? DASHBOARD_STAT_COLORS.discipline;
  const maxStreak = quests
    .filter((quest) => quest.type === 'daily' && !quest.isArchived)
    .reduce((best, quest) => {
      const streak = calculateQuestStreak(logs, quest.id);
      return Math.max(best, streak.current);
    }, 0);
  const glowStrength = Math.min(0.42, 0.16 + maxStreak * 0.018);
  const saturation = Math.min(1.18, 0.92 + maxStreak * 0.03);

  return {
    accent: dominantTheme.accent,
    glow: dominantTheme.glow,
    glowStrength,
    saturation,
    dominantStatKey,
    maxStreak,
  };
}

export function getAvatarColorValue(
  value: AvatarProfile['skinTone'] | AvatarProfile['eyeColor'] | AvatarProfile['hairColor'],
) {
  const colorOption = [
    ...AVATAR_SKIN_TONE_OPTIONS,
    ...AVATAR_EYE_COLOR_OPTIONS,
    ...AVATAR_HAIR_COLOR_OPTIONS,
  ].find((option) => option.value === value);

  return colorOption?.color ?? '#5c4031';
}
