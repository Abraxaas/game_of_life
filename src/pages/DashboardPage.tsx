import type { CompletionLog, Quest, Stat, StorageKind, UserProfile } from '../types/domain';
import { ProfileSummary } from '../features/stats/ProfileSummary';
import { StatsOverview } from '../features/stats/StatsOverview';
import { TodaySummary } from '../features/stats/TodaySummary';
import { QuestList } from '../features/quests/QuestList';

interface DashboardPageProps {
  profile: UserProfile;
  stats: Stat[];
  quests: Quest[];
  completionLogs: CompletionLog[];
  storageKind: StorageKind | null;
  showCompletedCurrentPeriod: boolean;
  enableConfirmations: boolean;
  onCreateQuest: () => void;
  onEditQuest: (quest: Quest) => void;
  onCompleteQuest: (questId: string) => Promise<boolean>;
  onArchiveQuest: (questId: string) => Promise<boolean>;
  onDeleteQuest: (questId: string) => Promise<boolean>;
  onRestoreQuest: (questId: string) => Promise<boolean>;
  onUpdateUsername: (username: string) => Promise<boolean>;
}

export function DashboardPage({
  profile,
  stats,
  quests,
  completionLogs,
  storageKind,
  showCompletedCurrentPeriod,
  enableConfirmations,
  onCreateQuest,
  onEditQuest,
  onCompleteQuest,
  onArchiveQuest,
  onDeleteQuest,
  onRestoreQuest,
  onUpdateUsername,
}: DashboardPageProps) {
  return (
    <div className="page-stack">
      <section className="hero panel">
        <div>
          <p className="eyebrow">Главная</p>
          <h1>Рутина как спокойная ролевая прокачка</h1>
          <p className="hero__text">
            Открыл приложение, отметил полезное действие, получил прогресс. Без наказаний,
            без лишних экранов, только понятный личный контроль.
          </p>
        </div>

        <button type="button" className="primary-button" onClick={onCreateQuest}>
          Создать квест
        </button>
      </section>

      <ProfileSummary
        profile={profile}
        storageKind={storageKind}
        onUpdateUsername={onUpdateUsername}
      />

      <TodaySummary
        profile={profile}
        quests={quests}
        completionLogs={completionLogs}
      />

      <StatsOverview stats={stats} />

      <QuestList
        quests={quests}
        stats={stats}
        completionLogs={completionLogs}
        showCompletedCurrentPeriod={showCompletedCurrentPeriod}
        enableConfirmations={enableConfirmations}
        onComplete={onCompleteQuest}
        onEdit={onEditQuest}
        onArchive={onArchiveQuest}
        onDelete={onDeleteQuest}
        onRestore={onRestoreQuest}
      />
    </div>
  );
}
