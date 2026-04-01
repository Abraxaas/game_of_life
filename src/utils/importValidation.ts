import { SNAPSHOT_SCHEMA_VERSION } from '../shared/constants';
import {
  AVATAR_BEARD_STYLE_OPTIONS,
  AVATAR_EYE_COLOR_OPTIONS,
  AVATAR_GENDER_OPTIONS,
  AVATAR_HAIR_COLOR_OPTIONS,
  AVATAR_HAIR_STYLE_OPTIONS,
  AVATAR_SKIN_TONE_OPTIONS,
} from '../shared/avatarConfig';
import { STAT_DEFINITIONS } from '../shared/statConfig';
import type {
  AppDataSnapshot,
  AppSettings,
  AvatarBeardStyle,
  AvatarEyeColor,
  AvatarGender,
  AvatarHairColor,
  AvatarHairStyle,
  AvatarProfile,
  AvatarSkinTone,
  CompletionLog,
  ImportValidationResult,
  QuestType,
  Stat,
  UserProfile,
} from '../types/domain';

const VALID_STAT_KEYS = new Set(STAT_DEFINITIONS.map((definition) => definition.key));
const VALID_AVATAR_GENDERS = new Set(
  AVATAR_GENDER_OPTIONS.map((option) => option.value),
);
const VALID_AVATAR_SKIN_TONES = new Set(
  AVATAR_SKIN_TONE_OPTIONS.map((option) => option.value),
);
const VALID_AVATAR_EYE_COLORS = new Set(
  AVATAR_EYE_COLOR_OPTIONS.map((option) => option.value),
);
const VALID_AVATAR_HAIR_COLORS = new Set(
  AVATAR_HAIR_COLOR_OPTIONS.map((option) => option.value),
);
const VALID_AVATAR_HAIR_STYLES = new Set(
  AVATAR_HAIR_STYLE_OPTIONS.map((option) => option.value),
);
const VALID_AVATAR_BEARDS = new Set(
  AVATAR_BEARD_STYLE_OPTIONS.map((option) => option.value),
);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isQuestType(value: unknown): value is QuestType {
  return (
    value === 'daily' ||
    value === 'weekly' ||
    value === 'monthly' ||
    value === 'one_time'
  );
}

function isStat(value: unknown): value is Stat {
  if (!isObject(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.key) &&
    VALID_STAT_KEYS.has(value.key) &&
    isString(value.name) &&
    isString(value.icon) &&
    isNumber(value.level) &&
    isNumber(value.xp) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function hasExpectedStatSet(stats: Stat[]) {
  if (stats.length !== STAT_DEFINITIONS.length) {
    return false;
  }

  const keys = new Set(stats.map((stat) => stat.key));
  return STAT_DEFINITIONS.every((definition) => keys.has(definition.key));
}

function isAvatar(value: unknown): value is AvatarProfile {
  if (!isObject(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.gender) &&
    VALID_AVATAR_GENDERS.has(value.gender as AvatarGender) &&
    isString(value.skinTone) &&
    VALID_AVATAR_SKIN_TONES.has(value.skinTone as AvatarSkinTone) &&
    isString(value.eyeColor) &&
    VALID_AVATAR_EYE_COLORS.has(value.eyeColor as AvatarEyeColor) &&
    isString(value.hairColor) &&
    VALID_AVATAR_HAIR_COLORS.has(value.hairColor as AvatarHairColor) &&
    isString(value.hairStyle) &&
    VALID_AVATAR_HAIR_STYLES.has(value.hairStyle as AvatarHairStyle) &&
    isString(value.beardStyle) &&
    VALID_AVATAR_BEARDS.has(value.beardStyle as AvatarBeardStyle) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isQuest(value: unknown) {
  if (!isObject(value)) {
    return false;
  }

  const descriptionValid =
    value.description === undefined || isString(value.description);
  const rewardValid =
    value.rewardText === undefined || isString(value.rewardText);
  const lastCompletedValid =
    value.lastCompletedAt === undefined || isString(value.lastCompletedAt);

  return (
    isString(value.id) &&
    isString(value.title) &&
    descriptionValid &&
    isString(value.statKey) &&
    VALID_STAT_KEYS.has(value.statKey) &&
    isQuestType(value.type) &&
    (value.difficulty === 'easy' ||
      value.difficulty === 'medium' ||
      value.difficulty === 'hard') &&
    isNumber(value.xpReward) &&
    rewardValid &&
    isBoolean(value.isArchived) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    isBoolean(value.completedInPeriod) &&
    lastCompletedValid &&
    isNumber(value.timesCompleted)
  );
}

function isCompletionLog(value: unknown): value is CompletionLog {
  if (!isObject(value)) {
    return false;
  }

  const noteValid = value.note === undefined || isString(value.note);

  return (
    isString(value.id) &&
    isString(value.questId) &&
    isString(value.statKey) &&
    VALID_STAT_KEYS.has(value.statKey) &&
    isNumber(value.xpAwarded) &&
    isString(value.completedAt) &&
    noteValid
  );
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!isObject(value)) {
    return false;
  }

  const usernameValid = value.username === undefined || isString(value.username);

  return (
    isString(value.id) &&
    usernameValid &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    isNumber(value.totalLevel) &&
    isNumber(value.totalXp)
  );
}

function isAppSettings(value: unknown): value is AppSettings {
  if (!isObject(value)) {
    return false;
  }

  const lastBackupValid =
    value.lastBackupAt === undefined || isString(value.lastBackupAt);

  return (
    isString(value.id) &&
    value.theme === 'light' &&
    isBoolean(value.showCompletedCurrentPeriod) &&
    isBoolean(value.enableConfirmations) &&
    isBoolean(value.hasSeenOnboarding) &&
    lastBackupValid
  );
}

export function validateImportedSnapshot(
  value: unknown,
): ImportValidationResult {
  if (!isObject(value)) {
    return { ok: false, error: 'JSON должен содержать объект данных приложения.' };
  }

  if (!isNumber(value.schemaVersion)) {
    return {
      ok: false,
      error: 'В файле не указана версия структуры данных.',
    };
  }

  if (value.schemaVersion > SNAPSHOT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: 'Файл создан в более новой версии приложения.',
    };
  }

  if (value.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Эта версия приложения импортирует только JSON схемы ${SNAPSHOT_SCHEMA_VERSION}. Старые резервные копии больше не мигрируются автоматически.`,
    };
  }

  if (!Array.isArray(value.stats) || !value.stats.every(isStat)) {
    return { ok: false, error: 'Раздел stats имеет неверную структуру.' };
  }

  if (!hasExpectedStatSet(value.stats)) {
    return { ok: false, error: 'В файле указан неполный или лишний набор статов.' };
  }

  if (!Array.isArray(value.quests) || !value.quests.every(isQuest)) {
    return { ok: false, error: 'Раздел quests имеет неверную структуру.' };
  }

  if (
    !Array.isArray(value.completionLogs) ||
    !value.completionLogs.every(isCompletionLog)
  ) {
    return {
      ok: false,
      error: 'Раздел completionLogs имеет неверную структуру.',
    };
  }

  if (!isUserProfile(value.userProfile)) {
    return { ok: false, error: 'Раздел userProfile имеет неверную структуру.' };
  }

  if (value.avatar !== undefined && value.avatar !== null && !isAvatar(value.avatar)) {
    return { ok: false, error: 'Раздел avatar имеет неверную структуру.' };
  }

  if (!isAppSettings(value.appSettings)) {
    return { ok: false, error: 'Раздел appSettings имеет неверную структуру.' };
  }

  return {
    ok: true,
    data: value as unknown as AppDataSnapshot,
  };
}
