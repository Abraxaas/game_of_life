import { useState } from 'react';
import { AppProvider, useAppContext } from './AppContext';
import type { Quest } from '../types/domain';
import { APP_DESCRIPTION, APP_NAME } from '../shared/constants';
import { DashboardPage } from '../pages/DashboardPage';
import { HistoryPage } from '../pages/HistoryPage';
import { BackupPage } from '../pages/BackupPage';
import { QuestModal } from '../features/quests/QuestModal';
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
    completeQuest,
    updateProfileName,
    updateSettings,
    exportSnapshot,
    importSnapshot,
  } = useAppContext();
  const [isQuestModalOpen, setQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

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
          <p className="eyebrow">Local MVP</p>
          <h1>{APP_NAME}</h1>
          <p className="muted-text">{APP_DESCRIPTION}</p>
        </div>

        <button type="button" className="primary-button" onClick={handleOpenCreateQuest}>
          Новый квест
        </button>
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
          Dashboard
        </button>
        <button
          type="button"
          className={activePage === 'history' ? 'tab-button tab-button--active' : 'tab-button'}
          onClick={() => setActivePage('history')}
        >
          History
        </button>
        <button
          type="button"
          className={activePage === 'backup' ? 'tab-button tab-button--active' : 'tab-button'}
          onClick={() => setActivePage('backup')}
        >
          Backup / Settings
        </button>
      </nav>

      <main className="app-main">
        {activePage === 'dashboard' ? (
          <DashboardPage
            profile={snapshot.userProfile}
            stats={snapshot.stats}
            quests={snapshot.quests}
            completionLogs={snapshot.completionLogs}
            storageKind={storageKind}
            showCompletedToday={snapshot.appSettings.showCompletedToday}
            enableConfirmations={snapshot.appSettings.enableConfirmations}
            onCreateQuest={handleOpenCreateQuest}
            onEditQuest={handleOpenEditQuest}
            onCompleteQuest={completeQuest}
            onArchiveQuest={archiveQuest}
            onDeleteQuest={deleteQuest}
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
