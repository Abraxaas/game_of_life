import { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from './AppContext';
import type { Quest } from '../types/domain';
import { APP_DESCRIPTION, APP_NAME, APP_STAGE_LABEL } from '../shared/constants';
import { DashboardPage } from '../pages/DashboardPage';
import { HistoryPage } from '../pages/HistoryPage';
import { BackupPage } from '../pages/BackupPage';
import { QuestModal } from '../features/quests/QuestModal';
import { OnboardingModal } from '../features/onboarding/OnboardingModal';
import { ToastViewport } from '../components/ToastViewport';

function AppShell() {
  const {
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
  } = useAppContext();
  const [isQuestModalOpen, setQuestModalOpen] = useState(false);
  const [isOnboardingOpen, setOnboardingOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [hasAutoOpenedOnboarding, setHasAutoOpenedOnboarding] = useState(false);

  useEffect(() => {
    if (!ready || !snapshot || hasAutoOpenedOnboarding) {
      return;
    }

    if (!snapshot.appSettings.hasSeenOnboarding) {
      setOnboardingOpen(true);
    }

    setHasAutoOpenedOnboarding(true);
  }, [hasAutoOpenedOnboarding, ready, snapshot]);

  function handleOpenCreateQuest() {
    setEditingQuest(null);
    setQuestModalOpen(true);
  }

  function handleOpenEditQuest(quest: Quest) {
    setEditingQuest(quest);
    setQuestModalOpen(true);
  }

  function handleCloseQuestModal() {
    setQuestModalOpen(false);
    setEditingQuest(null);
  }

  async function handleCloseOnboarding() {
    setOnboardingOpen(false);

    if (!snapshot?.appSettings.hasSeenOnboarding) {
      await updateSettings({ hasSeenOnboarding: true });
    }
  }

  if (!ready || !snapshot) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <p className="eyebrow">Запуск</p>
          <h1>{APP_NAME}</h1>
          <p>{APP_DESCRIPTION}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">{APP_STAGE_LABEL}</p>
          <h1>{APP_NAME}</h1>
          <p className="muted-text">{APP_DESCRIPTION}</p>
        </div>

        <div className="app-header__actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setOnboardingOpen(true)}
          >
            Как это работает
          </button>
          <button type="button" className="primary-button" onClick={handleOpenCreateQuest}>
            Новый квест
          </button>
        </div>
      </header>

      {storageWarning ? (
        <div className="banner banner--warning">
          <p>{storageWarning}</p>
        </div>
      ) : null}

      <nav className="page-tabs" aria-label="Навигация по приложению">
        <button
          type="button"
          className={activePage === 'dashboard' ? 'tab-button tab-button--active' : 'tab-button'}
          onClick={() => setActivePage('dashboard')}
        >
          Главная
        </button>
        <button
          type="button"
          className={activePage === 'history' ? 'tab-button tab-button--active' : 'tab-button'}
          onClick={() => setActivePage('history')}
        >
          История
        </button>
        <button
          type="button"
          className={activePage === 'backup' ? 'tab-button tab-button--active' : 'tab-button'}
          onClick={() => setActivePage('backup')}
        >
          Резервная копия и настройки
        </button>
      </nav>

      <main className="app-main">
        {activePage === 'dashboard' ? (
          <DashboardPage
            profile={snapshot.userProfile}
            avatar={snapshot.avatar}
            stats={snapshot.stats}
            quests={snapshot.quests}
            completionLogs={snapshot.completionLogs}
            storageKind={storageKind}
            showCompletedCurrentPeriod={snapshot.appSettings.showCompletedCurrentPeriod}
            enableConfirmations={snapshot.appSettings.enableConfirmations}
            onCreateQuest={handleOpenCreateQuest}
            onEditQuest={handleOpenEditQuest}
            onCompleteQuest={completeQuest}
            onArchiveQuest={archiveQuest}
            onDeleteQuest={deleteQuest}
            onRestoreQuest={restoreQuest}
            onSaveAvatar={saveAvatar}
            onUpdateUsername={updateProfileName}
          />
        ) : null}

        {activePage === 'history' ? (
          <HistoryPage
            logs={snapshot.completionLogs}
            quests={snapshot.quests}
            stats={snapshot.stats}
          />
        ) : null}

        {activePage === 'backup' ? (
          <BackupPage
            settings={snapshot.appSettings}
            storageKind={storageKind}
            onUpdateSettings={updateSettings}
            onExport={exportSnapshot}
            onImport={importSnapshot}
          />
        ) : null}
      </main>

      <QuestModal
        open={isQuestModalOpen}
        quest={editingQuest}
        stats={snapshot.stats}
        onClose={handleCloseQuestModal}
        onSubmit={(values) =>
          editingQuest
            ? updateQuest(editingQuest.id, values)
            : createQuest(values)
        }
      />

      <OnboardingModal
        open={isOnboardingOpen}
        onClose={() => {
          void handleCloseOnboarding();
        }}
      />

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
