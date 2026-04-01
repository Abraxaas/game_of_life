import {
  DEFAULT_APP_SETTINGS,
  SNAPSHOT_SCHEMA_VERSION,
  USER_PROFILE_ID,
  XP_BY_DIFFICULTY,
} from '../shared/constants';
import { STAT_DEFINITIONS } from '../shared/statConfig';
import type { AppDataSnapshot, Quest, Stat, UserProfile } from '../types/domain';
import { createId } from '../utils/id';

function createBaseStat(nowIso: string, definition: (typeof STAT_DEFINITIONS)[number]): Stat {
  return {
    id: createId(),
    key: definition.key,
    name: definition.name,
    icon: definition.icon,
    level: 1,
    xp: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

function createDemoQuest(
  nowIso: string,
  input: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'completedInPeriod' | 'lastCompletedAt' | 'timesCompleted' | 'isArchived' | 'xpReward'>,
): Quest {
  return {
    id: createId(),
    title: input.title,
    description: input.description,
    statKey: input.statKey,
    type: input.type,
    difficulty: input.difficulty,
    xpReward: XP_BY_DIFFICULTY[input.difficulty],
    rewardText: input.rewardText,
    isArchived: false,
    createdAt: nowIso,
    updatedAt: nowIso,
    completedInPeriod: false,
    lastCompletedAt: undefined,
    timesCompleted: 0,
  };
}

function createUserProfile(nowIso: string, totalLevel: number): UserProfile {
  return {
    id: USER_PROFILE_ID,
    createdAt: nowIso,
    updatedAt: nowIso,
    totalLevel,
    totalXp: 0,
  };
}

export function createSeedSnapshot(): AppDataSnapshot {
  const nowIso = new Date().toISOString();
  const stats = STAT_DEFINITIONS.map((definition) => createBaseStat(nowIso, definition));

  const quests: Quest[] = [
    createDemoQuest(nowIso, {
      title: '15 минут планирования дня',
      description: 'Разобрать приоритеты и выбрать один главный фокус.',
      statKey: 'discipline',
      type: 'daily',
      difficulty: 'easy',
      rewardText: 'После этого можно спокойно открыть любимый плейлист.',
    }),
    createDemoQuest(nowIso, {
      title: 'Позвонить родителям',
      description: 'Один теплый созвон на неделе, без спешки и формальности.',
      statKey: 'socialization',
      type: 'weekly',
      difficulty: 'medium',
      rewardText: 'После звонка можно спокойно выдохнуть и заняться своим вечером.',
    }),
    createDemoQuest(nowIso, {
      title: 'Подвести бюджет месяца',
      description: 'Коротко сверить траты, накопления и один следующий финансовый шаг.',
      statKey: 'finance',
      type: 'monthly',
      difficulty: 'medium',
      rewardText: 'После этого приятно закрыть месяц с чувством порядка.',
    }),
    createDemoQuest(nowIso, {
      title: 'Записаться к стоматологу',
      description: 'Сделать неприятный, но полезный шаг без откладывания.',
      statKey: 'health',
      type: 'one_time',
      difficulty: 'hard',
      rewardText: 'После звонка можно спокойно прогуляться или выпить чай.',
    }),
  ];

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    stats,
    quests,
    completionLogs: [],
    userProfile: createUserProfile(nowIso, stats.length),
    avatar: null,
    appSettings: {
      ...DEFAULT_APP_SETTINGS,
    },
  };
}
