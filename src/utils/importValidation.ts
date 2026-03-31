import type {
  AppDataSnapshot,
  AppSettings,
  CompletionLog,
  ImportValidationResult,
  Stat,
  UserProfile,
} from '../types/domain';
import { SNAPSHOT_SCHEMA_VERSION } from '../shared/constants';
import {
  normalizeQuestDifficulty,
  normalizeQuestType,
} from './quests';

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

function isQuest(value: unknown, schemaVersion: number) {
  if (!isObject(value)) {
    return false;
  }

  const descriptionValid =
    value.description === undefined || isString(value.description);
  const rewardValid =
    value.rewardText === undefined || isString(value.rewardText);
  const lastCompletedValid =
    value.lastCompletedAt === undefined || isString(value.lastCompletedAt);
  const completionStateValid =
    schemaVersion === 1
      ? isBoolean(value.completedToday)
      : value.completedInPeriod === undefined || isBoolean(value.completedInPeriod);
  const typeValid =
    schemaVersion === 1
      ? value.type === 'one_time' || value.type === 'daily'
      : value.type === 'one_time' ||
        value.type === 'daily' ||
        value.type === 'weekly' ||
        value.type === 'monthly';

  return (
    isString(value.id) &&
    isString(value.title) &&
    descriptionValid &&
    isString(value.statKey) &&
    typeValid &&
    (value.difficulty === 'easy' || value.difficulty === 'medium' || value.difficulty === 'hard') &&
    isNumber(value.xpReward) &&
    rewardValid &&
    isBoolean(value.isArchived) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    completionStateValid &&
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

function isAppSettings(value: unknown, schemaVersion: number): value is AppSettings {
  if (!isObject(value)) {
    return false;
  }

  const lastBackupValid =
    value.lastBackupAt === undefined || isString(value.lastBackupAt);

  return (
    isString(value.id) &&
    isString(value.theme) &&
    (schemaVersion === 1
      ? isBoolean(value.showCompletedToday)
      : isBoolean(value.showCompletedCurrentPeriod)) &&
    isBoolean(value.enableConfirmations) &&
    (schemaVersion === 1
      ? true
      : value.hasSeenOnboarding === undefined || isBoolean(value.hasSeenOnboarding)) &&
    lastBackupValid
  );
}

function migrateSnapshot(value: Record<string, unknown>): AppDataSnapshot {
  const schemaVersion = value.schemaVersion as number;

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    stats: value.stats as Stat[],
    quests: (value.quests as Record<string, unknown>[]).map((quest) => ({
      id: quest.id as string,
      title: quest.title as string,
      description: quest.description as string | undefined,
      statKey: quest.statKey as string,
      type: normalizeQuestType(quest.type),
      difficulty: normalizeQuestDifficulty(quest.difficulty),
      xpReward: quest.xpReward as number,
      rewardText: quest.rewardText as string | undefined,
      isArchived: quest.isArchived as boolean,
      createdAt: quest.createdAt as string,
      updatedAt: quest.updatedAt as string,
      completedInPeriod:
        schemaVersion === 1
          ? (quest.completedToday as boolean)
          : ((quest.completedInPeriod as boolean | undefined) ?? false),
      lastCompletedAt: quest.lastCompletedAt as string | undefined,
      timesCompleted: quest.timesCompleted as number,
    })),
    completionLogs: value.completionLogs as CompletionLog[],
    userProfile: value.userProfile as UserProfile,
    appSettings: {
      ...(value.appSettings as AppSettings),
      showCompletedCurrentPeriod:
        schemaVersion === 1
          ? ((value.appSettings as Record<string, unknown>).showCompletedToday as boolean)
          : ((value.appSettings as Record<string, unknown>)
              .showCompletedCurrentPeriod as boolean),
      hasSeenOnboarding:
        schemaVersion === 1
          ? false
          : (((value.appSettings as Record<string, unknown>).hasSeenOnboarding as boolean | undefined) ??
            false),
    },
  };
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

  const schemaVersion = value.schemaVersion;

  if (schemaVersion > SNAPSHOT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: 'Файл создан в более новой версии приложения.',
    };
  }

  if (schemaVersion < 1) {
    return {
      ok: false,
      error:
        'Файл создан в слишком старой версии схемы. Автоматическая миграция недоступна.',
    };
  }

  if (!Array.isArray(value.stats) || !value.stats.every(isStat)) {
    return { ok: false, error: 'Раздел stats имеет неверную структуру.' };
  }

  if (
    !Array.isArray(value.quests) ||
    !value.quests.every((quest) => isQuest(quest, schemaVersion))
  ) {
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

  if (!isAppSettings(value.appSettings, schemaVersion)) {
    return { ok: false, error: 'Раздел appSettings имеет неверную структуру.' };
  }

  return {
    ok: true,
    data: migrateSnapshot(value),
  };
}
