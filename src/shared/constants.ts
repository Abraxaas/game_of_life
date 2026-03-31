import type { AppSettings, QuestDifficulty, QuestType } from '../types/domain';

export const APP_NAME = 'Игра жизни';
export const APP_DESCRIPTION =
  'Онлайн-версия 1.1 для спокойной геймификации рутины с ежедневными, еженедельными, ежемесячными и разовыми квестами.';
export const APP_STAGE_LABEL = 'Онлайн-версия 1.1';

export const STORAGE_DB_NAME = 'routine-rpg-mvp';
export const STORAGE_DB_VERSION = 1;
export const SNAPSHOT_SCHEMA_VERSION = 2;

export const USER_PROFILE_ID = 'user-profile';
export const APP_SETTINGS_ID = 'app-settings';
export const UI_PAGE_STORAGE_KEY = 'routine-rpg-active-page';

export const XP_BY_DIFFICULTY: Record<QuestDifficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

export const XP_PER_LEVEL = 100;

export const DIFFICULTY_LABELS: Record<QuestDifficulty, string> = {
  easy: 'Легкий',
  medium: 'Средний',
  hard: 'Сложный',
};

export const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  daily: 'Ежедневный',
  weekly: 'Еженедельный',
  monthly: 'Ежемесячный',
  one_time: 'Разовый',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: APP_SETTINGS_ID,
  theme: 'light',
  showCompletedCurrentPeriod: true,
  enableConfirmations: true,
  hasSeenOnboarding: false,
};
