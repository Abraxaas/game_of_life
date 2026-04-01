import type { CSSProperties } from 'react';
import type {
  AvatarFormValues,
  AvatarProfile,
  CompletionLog,
  Quest,
  Stat,
  StorageKind,
  UserProfile,
} from '../types/domain';
import { AvatarPanel } from '../features/avatar/AvatarPanel';
import { ProfileSummary } from '../features/stats/ProfileSummary';
import { StatsOverview } from '../features/stats/StatsOverview';
import { TodaySummary } from '../features/stats/TodaySummary';
import { QuestList } from '../features/quests/QuestList';
import { getDashboardBackgroundTheme } from '../utils/avatar';

interface DashboardPageProps {
  profile: UserProfile;
  avatar: AvatarProfile | null;
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
  onSaveAvatar: (values: AvatarFormValues) => Promise<boolean>;
  onUpdateUsername: (username: string) => Promise<boolean>;
}

export function DashboardPage({
  profile,
  avatar,
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
  onSaveAvatar,
  onUpdateUsername,
}: DashboardPageProps) {
  const dashboardTheme = getDashboardBackgroundTheme(stats, quests, completionLogs);
  const dashboardStyle = {
    '--dashboard-accent': dashboardTheme.accent,
    '--dashboard-glow': dashboardTheme.glow,
    '--dashboard-glow-strength': `${dashboardTheme.glowStrength}`,
    '--dashboard-saturation': `${dashboardTheme.saturation}`,
  } as CSSProperties;

  return (
    <div className="page-stack dashboard-page" style={dashboardStyle}>
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

      <AvatarPanel
        avatar={avatar}
        stats={stats}
        onSaveAvatar={onSaveAvatar}
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
