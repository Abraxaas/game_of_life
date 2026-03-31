export type StatKey = string;

export type QuestType = 'one_time' | 'daily' | 'weekly' | 'monthly';
export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type AppTheme = 'light';
export type ToastTone = 'success' | 'error' | 'info';
export type PageKey = 'dashboard' | 'history' | 'backup';
export type StorageKind = 'indexeddb' | 'memory';

export interface Stat {
  id: string;
  key: StatKey;
  name: string;
  icon: string;
  level: number;
  xp: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  statKey: StatKey;
  type: QuestType;
  difficulty: QuestDifficulty;
  xpReward: number;
  rewardText?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  completedInPeriod: boolean;
  lastCompletedAt?: string;
  timesCompleted: number;
}

export interface CompletionLog {
  id: string;
  questId: string;
  statKey: StatKey;
  xpAwarded: number;
  completedAt: string;
  note?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
  totalLevel: number;
  totalXp: number;
}

export interface AppSettings {
  id: string;
  theme: AppTheme;
  showCompletedCurrentPeriod: boolean;
  enableConfirmations: boolean;
  hasSeenOnboarding: boolean;
  lastBackupAt?: string;
}

export interface AppDataSnapshot {
  schemaVersion: number;
  stats: Stat[];
  quests: Quest[];
  completionLogs: CompletionLog[];
  userProfile: UserProfile;
  appSettings: AppSettings;
}

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface StreakSummary {
  current: number;
  best: number;
}

export interface QuestFormValues {
  title: string;
  description: string;
  statKey: StatKey;
  type: QuestType;
  difficulty: QuestDifficulty;
  rewardText: string;
}

export interface StorageInitResult {
  persistence: StorageKind;
  snapshot: AppDataSnapshot;
  warning?: string;
}

export interface ImportValidationSuccess {
  ok: true;
  data: AppDataSnapshot;
}

export interface ImportValidationFailure {
  ok: false;
  error: string;
}

export type ImportValidationResult =
  | ImportValidationSuccess
  | ImportValidationFailure;
