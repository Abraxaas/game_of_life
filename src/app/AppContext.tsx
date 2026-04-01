import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppDataSnapshot,
  AppSettings,
  AvatarFormValues,
  PageKey,
  Quest,
  QuestFormValues,
  StorageKind,
  ToastMessage,
  ToastTone,
} from '../types/domain';
import { UI_PAGE_STORAGE_KEY, XP_BY_DIFFICULTY } from '../shared/constants';
import { initializeStorage, normalizeSnapshot, persistSnapshot } from '../storage/appStorage';
import { createSeedSnapshot } from '../storage/seed';
import { validateImportedSnapshot } from '../utils/importValidation';
import { buildAvatarProfile } from '../utils/avatar';
import { createId } from '../utils/id';
import {
  canRestoreQuest,
  isQuestCompletedInCurrentPeriod,
  isRecurringQuestType,
} from '../utils/quests';

interface ExportPayload {
  fileName: string;
  data: string;
}

interface AppContextValue {
  ready: boolean;
  snapshot: AppDataSnapshot | null;
  activePage: PageKey;
  storageKind: StorageKind | null;
  storageWarning?: string;
  toasts: ToastMessage[];
  setActivePage: (page: PageKey) => void;
  dismissToast: (toastId: string) => void;
  createQuest: (values: QuestFormValues) => Promise<boolean>;
  updateQuest: (questId: string, values: QuestFormValues) => Promise<boolean>;
  archiveQuest: (questId: string) => Promise<boolean>;
  deleteQuest: (questId: string) => Promise<boolean>;
  restoreQuest: (questId: string) => Promise<boolean>;
  completeQuest: (questId: string) => Promise<boolean>;
  saveAvatar: (values: AvatarFormValues) => Promise<boolean>;
  updateProfileName: (username: string) => Promise<boolean>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<boolean>;
  exportSnapshot: () => Promise<ExportPayload | null>;
  importSnapshot: (rawJson: string) => Promise<boolean>;
}

interface PushToastOptions {
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface CommitSnapshotOptions {
  successMessage?: string;
  errorMessage?: string;
  undoable?: boolean;
  undoSuccessMessage?: string;
}

interface UndoEntry {
  token: string;
  snapshot: AppDataSnapshot;
  successMessage: string;
}

const AppContext = createContext<AppContextValue | null>(null);

function readStoredPage(): PageKey {
  try {
    const value = window.localStorage.getItem(UI_PAGE_STORAGE_KEY);

    if (value === 'dashboard' || value === 'history' || value === 'backup') {
      return value;
    }
  } catch {
    return 'dashboard';
  }

  return 'dashboard';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<AppDataSnapshot | null>(null);
  const [ready, setReady] = useState(false);
  const [activePage, setActivePageState] = useState<PageKey>(readStoredPage);
  const [storageKind, setStorageKind] = useState<StorageKind | null>(null);
  const [storageWarning, setStorageWarning] = useState<string>();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const snapshotRef = useRef<AppDataSnapshot | null>(null);
  const undoRef = useRef<UndoEntry | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const result = await initializeStorage();

        if (cancelled) {
          return;
        }

        snapshotRef.current = result.snapshot;
        setSnapshot(result.snapshot);
        setStorageKind(result.persistence);
        setStorageWarning(result.warning);
        setReady(true);

        if (result.warning) {
          pushToast(result.warning, 'info');
        }
      } catch {
        if (cancelled) {
          return;
        }

        const fallbackSnapshot = createSeedSnapshot();
        snapshotRef.current = fallbackSnapshot;
        setSnapshot(fallbackSnapshot);
        setStorageKind('memory');
        pushToast(
          'Не удалось инициализировать приложение. Попробуйте перезагрузить страницу.',
          'error',
        );
        setReady(true);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  function pushToast(
    text: string,
    tone: ToastTone,
    options?: PushToastOptions,
  ) {
    const toastId = createId();
    const nextToast: ToastMessage = {
      id: toastId,
      text,
      tone,
      actionLabel: options?.actionLabel,
      onAction: options?.onAction,
    };

    setToasts((currentToasts) => [...currentToasts, nextToast]);

    window.setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== toastId),
      );
    }, options?.durationMs ?? (options?.actionLabel ? 7000 : 4200));
  }

  function dismissToast(toastId: string) {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    );
  }

  function setActivePage(page: PageKey) {
    setActivePageState(page);

    try {
      window.localStorage.setItem(UI_PAGE_STORAGE_KEY, page);
    } catch {
      return;
    }
  }

  async function commitSnapshot(
    nextSnapshot: AppDataSnapshot,
    options?: CommitSnapshotOptions,
  ) {
    const previousSnapshot = snapshotRef.current;
    const normalized = normalizeSnapshot(nextSnapshot);

    snapshotRef.current = normalized;
    setSnapshot(normalized);

    try {
      await persistSnapshot(normalized);

      let undoToken: string | null = null;

      if (options?.undoable && previousSnapshot) {
        undoToken = createId();
        undoRef.current = {
          token: undoToken,
          snapshot: previousSnapshot,
          successMessage: options.undoSuccessMessage ?? 'Последнее действие отменено.',
        };
      }

      if (options?.successMessage) {
        pushToast(
          options.successMessage,
          'success',
          undoToken
            ? {
                actionLabel: 'Отменить',
                onAction: () => {
                  void undoSnapshot(undoToken);
                },
              }
            : undefined,
        );
      }

      return true;
    } catch {
      if (options?.errorMessage) {
        pushToast(options.errorMessage, 'error');
      } else {
        pushToast('Не удалось сохранить изменения в браузере.', 'error');
      }

      return false;
    }
  }

  async function undoSnapshot(token: string) {
    const entry = undoRef.current;

    if (!entry || entry.token !== token) {
      pushToast('Это действие уже нельзя отменить.', 'info');
      return false;
    }

    const normalized = normalizeSnapshot(entry.snapshot);

    snapshotRef.current = normalized;
    setSnapshot(normalized);

    try {
      await persistSnapshot(normalized);
      undoRef.current = null;
      pushToast(entry.successMessage, 'success');
      return true;
    } catch {
      pushToast('Не удалось отменить последнее действие.', 'error');
      return false;
    }
  }

  async function createQuest(values: QuestFormValues) {
    const currentSnapshot = snapshotRef.current;

    if (!currentSnapshot) {
      return false;
    }

    const nowIso = new Date().toISOString();
    const nextQuest: Quest = {
      id: createId(),
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      statKey: values.statKey,
      type: values.type,
      difficulty: values.difficulty,
      xpReward: XP_BY_DIFFICULTY[values.difficulty],
      rewardText: values.rewardText.trim() || undefined,
      isArchived: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      completedInPeriod: false,
      lastCompletedAt: undefined,
      timesCompleted: 0,
    };

    return commitSnapshot(
      {
        ...currentSnapshot,
        quests: [nextQuest, ...currentSnapshot.quests],
      },
      {
        successMessage: 'Квест создан и сохранен в браузере.',
        undoable: true,
        undoSuccessMessage: 'Создание квеста отменено.',
      },
    );
  }

  async function updateQuest(questId: string, values: QuestFormValues) {
    const currentSnapshot = snapshotRef.current;

    if (!currentSnapshot) {
      return false;
    }

    const nowIso = new Date().toISOString();

    return commitSnapshot(
      {
        ...currentSnapshot,
        quests: currentSnapshot.quests.map((quest) => {
          if (quest.id !== questId) {
            return quest;
          }

          const nextType = values.type;
          const shouldArchive = nextType === 'one_time' && quest.timesCompleted > 0;

          return {
            ...quest,
            title: values.title.trim(),
            description: values.description.trim() || undefined,
            statKey: values.statKey,
            type: nextType,
            difficulty: values.difficulty,
            xpReward: XP_BY_DIFFICULTY[values.difficulty],
            rewardText: values.rewardText.trim() || undefined,
            isArchived: shouldArchive ? true : quest.isArchived,
            completedInPeriod: isQuestCompletedInCurrentPeriod(
              nextType,
              quest.lastCompletedAt,
            ),
            updatedAt: nowIso,
          };
        }),
      },
      {
        successMessage: 'Квест обновлен.',
        undoable: true,
        undoSuccessMessage: 'Изменения квеста отменены.',
      },
    );
  }

  async function archiveQuest(questId: string) {
    const currentSnapshot = snapshotRef.current;

    if (!currentSnapshot) {
      return false;
    }

    const nowIso = new Date().toISOString();

    return commitSnapshot(
      {
        ...currentSnapshot,
        quests: currentSnapshot.quests.map((quest) =>
          quest.id === questId
            ? {
                ...quest,
                isArchived: true,
                updatedAt: nowIso,
              }
            : quest,
        ),
      },
      {
        successMessage: 'Квест перенесен в архив.',
        undoable: true,
        undoSuccessMessage: 'Перенос в архив отменен.',
      },
    );
  }

  async function deleteQuest(questId: string) {
    const currentSnapshot = snapshotRef.current;

    if (!currentSnapshot) {
      return false;
    }

    return commitSnapshot(
      {
        ...currentSnapshot,
        quests: currentSnapshot.quests.filter((quest) => quest.id !== questId),
        completionLogs: currentSnapshot.completionLogs.filter(
          (log) => log.questId !== questId,
        ),
      },
      {
        successMessage: 'Квест и связанные записи истории удалены.',
        undoable: true,
        undoSuccessMessage: 'Удаление отменено.',
      },
    );
  }

  async function restoreQuest(questId: string) {
    const currentSnapshot = snapshotRef.current;

    if (!currentSnapshot) {
      return false;
    }

    const quest = currentSnapshot.quests.find((item) => item.id === questId);

    if (!quest) {
      pushToast('Квест не найден.', 'error');
      return false;
    }

    if (!canRestoreQuest(quest)) {
      pushToast(
        'Завершенный разовый квест нельзя вернуть в активные без смены его истории.',
        'info',
      );
      return false;
    }

    return commitSnapshot(
      {
        ...currentSnapshot,
        quests: currentSnapshot.quests.map((item) =>
          item.id === questId
            ? {
                ...item,
                isArchived: false,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      },
      {
        successMessage: 'Квест возвращен из архива.',
        undoable: true,
        undoSuccessMessage: 'Возврат из архива отменен.',
      },
    );
  }

  async function completeQuest(questId: string) {
    const currentSnapshot = snapshotRef.current;

    if (!currentSnapshot) {
      return false;
    }

    const quest = currentSnapshot.quests.find((item) => item.id === questId);

    if (!quest) {
      pushToast('Квест не найден.', 'error');
      return false;
    }

    if (isRecurringQuestType(quest.type) && quest.completedInPeriod) {
      pushToast('Этот повторяющийся квест уже отмечен в текущем периоде.', 'info');
      return false;
    }

    if (quest.type === 'one_time' && quest.timesCompleted > 0) {
      pushToast('Разовый квест уже выполнен.', 'info');
      return false;
    }

    const relatedStat = currentSnapshot.stats.find(
      (stat) => stat.key === quest.statKey,
    );

    if (!relatedStat) {
      pushToast('Для этого квеста не найден связанный стат.', 'error');
      return false;
    }

    const nowIso = new Date().toISOString();
    const xpAwarded = quest.xpReward;

    const nextSnapshot: AppDataSnapshot = {
      ...currentSnapshot,
      stats: currentSnapshot.stats.map((stat) =>
        stat.key === quest.statKey
          ? {
              ...stat,
              xp: stat.xp + xpAwarded,
              updatedAt: nowIso,
            }
          : stat,
      ),
      quests: currentSnapshot.quests.map((item) =>
        item.id === questId
          ? {
              ...item,
              timesCompleted: item.timesCompleted + 1,
              lastCompletedAt: nowIso,
              completedInPeriod: isRecurringQuestType(item.type),
              isArchived: item.type === 'one_time' ? true : item.isArchived,
              updatedAt: nowIso,
            }
          : item,
      ),
      completionLogs: [
        {
          id: createId(),
          questId: quest.id,
          statKey: quest.statKey,
          xpAwarded,
          completedAt: nowIso,
        },
        ...currentSnapshot.completionLogs,
      ],
    };

    const rewardSuffix = quest.rewardText
      ? ` Награда: ${quest.rewardText}`
      : '';

    return commitSnapshot(nextSnapshot, {
      successMessage: `Квест выполнен. +${xpAwarded} опыта.${rewardSuffix}`,
      undoable: true,
      undoSuccessMessage: 'Последнее выполнение отменено.',
    });
  }

  async function saveAvatar(values: AvatarFormValues) {
    const currentSnapshot = snapshotRef.current;

    if (!currentSnapshot) {
      return false;
    }

    const nextAvatar = buildAvatarProfile(values, currentSnapshot.avatar);

    return commitSnapshot(
      {
        ...currentSnapshot,
        avatar: nextAvatar,
      },
      {
        successMessage: currentSnapshot.avatar
          ? 'Аватар обновлен.'
          : 'Аватар создан.',
        undoable: true,
        undoSuccessMessage: currentSnapshot.avatar
          ? 'Изменения аватара отменены.'
          : 'Создание аватара отменено.',
      },
    );
  }

  async function updateProfileName(username: string) {
    const currentSnapshot = snapshotRef.current;

    if (!currentSnapshot) {
      return false;
    }

    const trimmedUsername = username.trim();

    return commitSnapshot(
      {
        ...currentSnapshot,
        userProfile: {
          ...currentSnapshot.userProfile,
          username: trimmedUsername || undefined,
          updatedAt: new Date().toISOString(),
        },
      },
      {
        successMessage: trimmedUsername
          ? 'Псевдоним сохранен.'
          : 'Псевдоним очищен.',
      },
    );
  }

  async function updateSettings(patch: Partial<AppSettings>) {
    const currentSnapshot = snapshotRef.current;

    if (!currentSnapshot) {
      return false;
    }

    return commitSnapshot({
      ...currentSnapshot,
      appSettings: {
        ...currentSnapshot.appSettings,
        ...patch,
      },
    });
  }

  async function exportSnapshot() {
    const currentSnapshot = snapshotRef.current;

    if (!currentSnapshot) {
      return null;
    }

    const exportedAt = new Date().toISOString();
    const nextSnapshot = normalizeSnapshot({
      ...currentSnapshot,
      appSettings: {
        ...currentSnapshot.appSettings,
        lastBackupAt: exportedAt,
      },
    });

    snapshotRef.current = nextSnapshot;
    setSnapshot(nextSnapshot);

    try {
      await persistSnapshot(nextSnapshot);
    } catch {
      pushToast(
        'Экспорт подготовлен, но не удалось обновить отметку о резервной копии.',
        'info',
      );
    }

    pushToast('Резервная копия подготовлена.', 'success');

    return {
      fileName: `routine-rpg-backup-${exportedAt.slice(0, 10)}.json`,
      data: JSON.stringify(nextSnapshot, null, 2),
    };
  }

  async function importSnapshot(rawJson: string) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawJson);
    } catch {
      pushToast('Импорт не выполнен: файл содержит битый JSON.', 'error');
      return false;
    }

    const validation = validateImportedSnapshot(parsed);

    if (!validation.ok) {
      pushToast(`Импорт не выполнен: ${validation.error}`, 'error');
      return false;
    }

    const nextSnapshot = normalizeSnapshot(validation.data);
    return commitSnapshot(nextSnapshot, {
      successMessage: 'Данные импортированы и сохранены в браузере.',
      errorMessage:
        'Данные импортированы в интерфейс, но не удалось сохранить их в браузере.',
      undoable: true,
      undoSuccessMessage: 'Импорт отменен. Возвращена предыдущая локальная версия.',
    });
  }

  const value: AppContextValue = {
    ready,
    snapshot,
    activePage,
    storageKind,
    storageWarning,
    toasts,
    setActivePage,
    dismissToast,
    createQuest,
    updateQuest,
    archiveQuest,
    deleteQuest,
    restoreQuest,
    completeQuest,
    saveAvatar,
    updateProfileName,
    updateSettings,
    exportSnapshot,
    importSnapshot,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}
