import {
  AVATAR_BEARD_STYLE_OPTIONS,
  AVATAR_EYE_COLOR_OPTIONS,
  AVATAR_GENDER_OPTIONS,
  AVATAR_HAIR_COLOR_OPTIONS,
  AVATAR_HAIR_STYLE_OPTIONS,
  AVATAR_SKIN_TONE_OPTIONS,
  DASHBOARD_STAT_COLORS,
  DEFAULT_AVATAR_VALUES,
} from '../shared/avatarConfig';
import type {
  AvatarBeardStyle,
  AvatarEyeColor,
  AvatarFormValues,
  AvatarGender,
  AvatarHairColor,
  AvatarHairStyle,
  AvatarProfile,
  CompletionLog,
  Quest,
  Stat,
  StatKey,
} from '../types/domain';
import { createId } from './id';
import { calculateQuestStreak } from './streaks';

interface PartialAvatarProfile extends Partial<AvatarProfile> {}

const VALID_AVATAR_VALUES = {
  gender: new Set(AVATAR_GENDER_OPTIONS.map((option) => option.value)),
  skinTone: new Set(AVATAR_SKIN_TONE_OPTIONS.map((option) => option.value)),
  eyeColor: new Set(AVATAR_EYE_COLOR_OPTIONS.map((option) => option.value)),
  hairColor: new Set(AVATAR_HAIR_COLOR_OPTIONS.map((option) => option.value)),
  hairStyle: new Set(AVATAR_HAIR_STYLE_OPTIONS.map((option) => option.value)),
  beardStyle: new Set(AVATAR_BEARD_STYLE_OPTIONS.map((option) => option.value)),
};

function normalizeEnumValue<T extends string>(
  value: unknown,
  allowedValues: Set<T>,
  fallback: T,
) {
  return typeof value === 'string' && allowedValues.has(value as T)
    ? (value as T)
    : fallback;
}

export function normalizeAvatarProfile(
  avatar?: PartialAvatarProfile | null,
): AvatarProfile | null {
  if (!avatar) {
    return null;
  }

  const nowIso = new Date().toISOString();

  return {
    id: typeof avatar.id === 'string' ? avatar.id : createId(),
    gender: normalizeEnumValue<AvatarGender>(
      avatar.gender,
      VALID_AVATAR_VALUES.gender,
      DEFAULT_AVATAR_VALUES.gender,
    ),
    skinTone: normalizeEnumValue(
      avatar.skinTone,
      VALID_AVATAR_VALUES.skinTone,
      DEFAULT_AVATAR_VALUES.skinTone,
    ),
    eyeColor: normalizeEnumValue<AvatarEyeColor>(
      avatar.eyeColor,
      VALID_AVATAR_VALUES.eyeColor,
      DEFAULT_AVATAR_VALUES.eyeColor,
    ),
    hairColor: normalizeEnumValue<AvatarHairColor>(
      avatar.hairColor,
      VALID_AVATAR_VALUES.hairColor,
      DEFAULT_AVATAR_VALUES.hairColor,
    ),
    hairStyle: normalizeEnumValue<AvatarHairStyle>(
      avatar.hairStyle,
      VALID_AVATAR_VALUES.hairStyle,
      DEFAULT_AVATAR_VALUES.hairStyle,
    ),
    beardStyle: normalizeEnumValue<AvatarBeardStyle>(
      avatar.beardStyle,
      VALID_AVATAR_VALUES.beardStyle,
      DEFAULT_AVATAR_VALUES.beardStyle,
    ),
    createdAt: typeof avatar.createdAt === 'string' ? avatar.createdAt : nowIso,
    updatedAt: typeof avatar.updatedAt === 'string' ? avatar.updatedAt : nowIso,
  };
}

export function buildAvatarProfile(
  values: AvatarFormValues,
  currentAvatar?: AvatarProfile | null,
) {
  const nowIso = new Date().toISOString();

  return normalizeAvatarProfile({
    id: currentAvatar?.id,
    createdAt: currentAvatar?.createdAt ?? nowIso,
    updatedAt: nowIso,
    ...values,
  });
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
