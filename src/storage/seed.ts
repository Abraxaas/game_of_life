import { DEFAULT_APP_SETTINGS, SNAPSHOT_SCHEMA_VERSION, USER_PROFILE_ID, XP_BY_DIFFICULTY } from '../shared/constants';
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
  input: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'completedToday' | 'lastCompletedAt' | 'timesCompleted' | 'isArchived' | 'xpReward'>,
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
    completedToday: false,
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
      title: 'Пройти тренировку',
      description: 'Хотя бы 20 минут движения в комфортном темпе.',
      statKey: 'health',
      type: 'daily',
      difficulty: 'medium',
      rewardText: 'После выполнения устрой себе спокойный душ и короткий отдых.',
    }),
    createDemoQuest(nowIso, {
      title: 'Не заказывать доставку сегодня',
      description: 'Сделать более осознанный выбор и сэкономить деньги.',
      statKey: 'finance',
      type: 'daily',
      difficulty: 'easy',
      rewardText: 'Вечером можно взять хороший кофе без чувства вины.',
    }),
    createDemoQuest(nowIso, {
      title: 'Разобрать рабочий стол',
      description: 'Убрать бумаги, выбросить лишнее, освободить пространство.',
      statKey: 'order',
      type: 'one_time',
      difficulty: 'medium',
      rewardText: 'После этого закрой ноутбук на 15 минут и передохни.',
    }),
    createDemoQuest(nowIso, {
      title: 'Записаться к стоматологу',
      description: 'Сделать неприятный, но полезный шаг без откладывания.',
      statKey: 'health',
      type: 'one_time',
      difficulty: 'hard',
      rewardText: 'После звонка можно спокойно прогуляться или выпить чай.',
    }),
    createDemoQuest(nowIso, {
      title: 'Сделать неприятный звонок',
      description: 'Решить зависший вопрос, который давно висит в голове.',
      statKey: 'socialization',
      type: 'one_time',
      difficulty: 'medium',
      rewardText: 'После выполнения можно снять напряжение короткой прогулкой.',
    }),
  ];

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    stats,
    quests,
    completionLogs: [],
    userProfile: createUserProfile(nowIso, stats.length),
    appSettings: {
      ...DEFAULT_APP_SETTINGS,
    },
  };
}
