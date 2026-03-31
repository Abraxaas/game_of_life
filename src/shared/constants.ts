import type { AppSettings, QuestDifficulty } from '../types/domain';

export const APP_NAME = 'Игра жизни';
export const APP_DESCRIPTION =
  'Тестовая онлайн-версия 1.0 для спокойной геймификации рутины и полезных привычек.';
export const APP_STAGE_LABEL = 'Тестовая онлайн-версия 1.0';

export const STORAGE_DB_NAME = 'routine-rpg-mvp';
export const STORAGE_DB_VERSION = 1;
export const SNAPSHOT_SCHEMA_VERSION = 1;

export const USER_PROFILE_ID = 'user-profile';
export const APP_SETTINGS_ID = 'app-settings';
export const UI_PAGE_STORAGE_KEY = 'routine-rpg-active-page';

export const XP_BY_DIFFICULTY: Record<QuestDifficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

export const DIFFICULTY_LABELS: Record<QuestDifficulty, string> = {
  easy: 'Легкий',
  medium: 'Средний',
  hard: 'Сложный',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: APP_SETTINGS_ID,
  theme: 'light',
  showCompletedToday: true,
  enableConfirmations: true,
};
