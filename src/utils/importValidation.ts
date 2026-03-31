import type {
  AppDataSnapshot,
  AppSettings,
  CompletionLog,
  ImportValidationResult,
  Quest,
  Stat,
  UserProfile,
} from '../types/domain';
import { SNAPSHOT_SCHEMA_VERSION } from '../shared/constants';

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

function isStat(value: unknown): value is Stat {
  if (!isObject(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.key) &&
    isString(value.name) &&
    isString(value.icon) &&
    isNumber(value.level) &&
    isNumber(value.xp) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isQuest(value: unknown): value is Quest {
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
    (value.type === 'one_time' || value.type === 'daily') &&
    (value.difficulty === 'easy' ||
      value.difficulty === 'medium' ||
      value.difficulty === 'hard') &&
    isNumber(value.xpReward) &&
    rewardValid &&
    isBoolean(value.isArchived) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    isBoolean(value.completedToday) &&
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
    isString(value.theme) &&
    isBoolean(value.showCompletedToday) &&
    isBoolean(value.enableConfirmations) &&
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

  if (value.schemaVersion < SNAPSHOT_SCHEMA_VERSION) {
    return {
      ok: false,
      error:
        'Файл создан в более старой версии схемы. Для него пока нет автоматической миграции.',
    };
  }

  if (!Array.isArray(value.stats) || !value.stats.every(isStat)) {
    return { ok: false, error: 'Раздел stats имеет неверную структуру.' };
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

  if (!isAppSettings(value.appSettings)) {
    return { ok: false, error: 'Раздел appSettings имеет неверную структуру.' };
  }

  return {
    ok: true,
    data: value as unknown as AppDataSnapshot,
  };
}
