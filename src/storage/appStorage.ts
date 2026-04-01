import {
  DEFAULT_APP_SETTINGS,
  SNAPSHOT_SCHEMA_VERSION,
  USER_PROFILE_ID,
  XP_BY_DIFFICULTY,
} from '../shared/constants';
import { STAT_DEFINITIONS } from '../shared/statConfig';
import type {
  AppDataSnapshot,
  AppSettings,
  Quest,
  Stat,
  StorageInitResult,
  StorageKind,
  UserProfile,
} from '../types/domain';
import { createId } from '../utils/id';
import { isQuestCompletedInCurrentPeriod } from '../utils/quests';
import { calculateLevelProgress } from '../utils/xp';
import {
  hasIndexedDbSupport,
  openAppDatabase,
  requestToPromise,
  STORE_NAMES,
  transactionToPromise,
} from './db';
import { createSeedSnapshot } from './seed';

interface StorageAdapter {
  persistence: StorageKind;
  load(): Promise<AppDataSnapshot>;
  save(snapshot: AppDataSnapshot): Promise<void>;
}

function cloneSnapshot(snapshot: AppDataSnapshot) {
  return structuredClone(snapshot);
}

function rebuildStat(
  stat: Stat | undefined,
  fallback: { key: string; name: string; icon: string },
): Stat {
  const nowIso = new Date().toISOString();
  const xp = Math.max(0, stat?.xp ?? 0);
  const levelProgress = calculateLevelProgress(xp);

  return {
    id: stat?.id ?? createId(),
    key: fallback.key,
    name: fallback.name,
    icon: fallback.icon,
    level: levelProgress.level,
    xp,
    createdAt: stat?.createdAt ?? nowIso,
    updatedAt: stat?.updatedAt ?? nowIso,
  };
}

function rebuildQuest(quest: Quest): Quest {
  return {
    ...quest,
    title: quest.title.trim() || 'Без названия',
    description: quest.description?.trim() || undefined,
    rewardText: quest.rewardText?.trim() || undefined,
    xpReward: XP_BY_DIFFICULTY[quest.difficulty],
    completedInPeriod: isQuestCompletedInCurrentPeriod(
      quest.type,
      quest.lastCompletedAt,
    ),
  };
}

function buildProfile(
  stats: Stat[],
  currentProfile?: UserProfile,
): UserProfile {
  const nowIso = new Date().toISOString();

  return {
    id: currentProfile?.id ?? USER_PROFILE_ID,
    username: currentProfile?.username?.trim() || undefined,
    createdAt: currentProfile?.createdAt ?? nowIso,
    updatedAt: nowIso,
    totalLevel: stats.reduce((sum, stat) => sum + stat.level, 0),
    totalXp: stats.reduce((sum, stat) => sum + stat.xp, 0),
  };
}

function buildSettings(settings?: AppSettings): AppSettings {
  return {
    ...DEFAULT_APP_SETTINGS,
    ...settings,
    id: DEFAULT_APP_SETTINGS.id,
    showCompletedCurrentPeriod:
      settings?.showCompletedCurrentPeriod ??
      DEFAULT_APP_SETTINGS.showCompletedCurrentPeriod,
    enableConfirmations:
      settings?.enableConfirmations ??
      DEFAULT_APP_SETTINGS.enableConfirmations,
    hasSeenOnboarding:
      settings?.hasSeenOnboarding ??
      DEFAULT_APP_SETTINGS.hasSeenOnboarding,
  };
}

export function prepareSnapshot(snapshot: AppDataSnapshot): AppDataSnapshot {
  const knownStats = new Map(snapshot.stats.map((stat) => [stat.key, stat]));
  const stats = STAT_DEFINITIONS.map((definition) =>
    rebuildStat(knownStats.get(definition.key), definition),
  );

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    stats,
    quests: snapshot.quests.map(rebuildQuest),
    completionLogs: [...snapshot.completionLogs].sort((left, right) =>
      right.completedAt.localeCompare(left.completedAt),
    ),
    userProfile: buildProfile(stats, snapshot.userProfile),
    avatar: snapshot.avatar ?? null,
    appSettings: buildSettings(snapshot.appSettings),
  };
}

class IndexedDbStorage implements StorageAdapter {
  public persistence: StorageKind = 'indexeddb';

  private databasePromise = openAppDatabase();

  async load() {
    const database = await this.databasePromise;
    const transaction = database.transaction(
      [
        STORE_NAMES.stats,
        STORE_NAMES.quests,
        STORE_NAMES.completionLogs,
        STORE_NAMES.userProfile,
        STORE_NAMES.avatarProfile,
        STORE_NAMES.appSettings,
      ],
      'readonly',
    );

    const statsRequest = transaction.objectStore(STORE_NAMES.stats).getAll();
    const questsRequest = transaction.objectStore(STORE_NAMES.quests).getAll();
    const logsRequest = transaction
      .objectStore(STORE_NAMES.completionLogs)
      .getAll();
    const profileRequest = transaction
      .objectStore(STORE_NAMES.userProfile)
      .getAll();
    const avatarRequest = transaction
      .objectStore(STORE_NAMES.avatarProfile)
      .getAll();
    const settingsRequest = transaction
      .objectStore(STORE_NAMES.appSettings)
      .getAll();

    const [stats, quests, completionLogs, profiles, avatars, settings] =
      await Promise.all([
        requestToPromise(statsRequest),
        requestToPromise(questsRequest),
        requestToPromise(logsRequest),
        requestToPromise(profileRequest),
        requestToPromise(avatarRequest),
        requestToPromise(settingsRequest),
        transactionToPromise(transaction),
      ]);

    if (stats.length === 0 && profiles.length === 0) {
      return createSeedSnapshot();
    }

    const seed = createSeedSnapshot();

    return {
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      stats: stats.length > 0 ? stats : seed.stats,
      quests,
      completionLogs,
      userProfile: profiles[0] ?? seed.userProfile,
      avatar: avatars[0] ?? null,
      appSettings: settings[0] ?? seed.appSettings,
    };
  }

  async save(snapshot: AppDataSnapshot) {
    const database = await this.databasePromise;
    const transaction = database.transaction(
      [
        STORE_NAMES.stats,
        STORE_NAMES.quests,
        STORE_NAMES.completionLogs,
        STORE_NAMES.userProfile,
        STORE_NAMES.avatarProfile,
        STORE_NAMES.appSettings,
      ],
      'readwrite',
    );

    const statsStore = transaction.objectStore(STORE_NAMES.stats);
    const questsStore = transaction.objectStore(STORE_NAMES.quests);
    const logsStore = transaction.objectStore(STORE_NAMES.completionLogs);
    const profileStore = transaction.objectStore(STORE_NAMES.userProfile);
    const avatarStore = transaction.objectStore(STORE_NAMES.avatarProfile);
    const settingsStore = transaction.objectStore(STORE_NAMES.appSettings);

    statsStore.clear();
    questsStore.clear();
    logsStore.clear();
    profileStore.clear();
    avatarStore.clear();
    settingsStore.clear();

    snapshot.stats.forEach((stat) => {
      statsStore.put(stat);
    });

    snapshot.quests.forEach((quest) => {
      questsStore.put(quest);
    });

    snapshot.completionLogs.forEach((log) => {
      logsStore.put(log);
    });

    profileStore.put(snapshot.userProfile);

    if (snapshot.avatar) {
      avatarStore.put(snapshot.avatar);
    }

    settingsStore.put(snapshot.appSettings);

    await transactionToPromise(transaction);
  }
}

class MemoryStorage implements StorageAdapter {
  public persistence: StorageKind = 'memory';

  private snapshot = createSeedSnapshot();

  async load() {
    return cloneSnapshot(this.snapshot);
  }

  async save(snapshot: AppDataSnapshot) {
    this.snapshot = cloneSnapshot(snapshot);
  }
}

export async function initializeStorage(): Promise<StorageInitResult> {
  if (!hasIndexedDbSupport()) {
    const storage = new MemoryStorage();
    activeStoragePromise = Promise.resolve(storage);
    const snapshot = prepareSnapshot(await storage.load());

    await storage.save(snapshot);

    return {
      persistence: storage.persistence,
      snapshot,
      warning:
        'Хранилище браузера недоступно. Приложение перешло во временный режим без постоянного сохранения.',
    };
  }

  try {
    const storage = new IndexedDbStorage();
    activeStoragePromise = Promise.resolve(storage);
    const snapshot = prepareSnapshot(await storage.load());

    await storage.save(snapshot);

    return {
      persistence: storage.persistence,
      snapshot,
    };
  } catch {
    const storage = new MemoryStorage();
    activeStoragePromise = Promise.resolve(storage);
    const snapshot = prepareSnapshot(await storage.load());

    await storage.save(snapshot);

    return {
      persistence: storage.persistence,
      snapshot,
      warning:
        'Не удалось открыть хранилище браузера. Приложение работает во временной памяти.',
    };
  }
}

let activeStoragePromise: Promise<StorageAdapter> | null = null;

async function getActiveStorage() {
  if (!activeStoragePromise) {
    activeStoragePromise = (async () => {
      if (!hasIndexedDbSupport()) {
        return new MemoryStorage();
      }

      try {
        return new IndexedDbStorage();
      } catch {
        return new MemoryStorage();
      }
    })();
  }

  return activeStoragePromise;
}

export async function persistSnapshot(snapshot: AppDataSnapshot) {
  const storage = await getActiveStorage();
  await storage.save(prepareSnapshot(snapshot));
}
