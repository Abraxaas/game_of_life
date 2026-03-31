import type { CompletionLog, Quest, UserProfile } from '../../types/domain';
import { isToday } from '../../utils/date';
import { calculateLevelProgress } from '../../utils/xp';

interface TodaySummaryProps {
  profile: UserProfile;
  quests: Quest[];
  completionLogs: CompletionLog[];
}

export function TodaySummary({
  profile,
  quests,
  completionLogs,
}: TodaySummaryProps) {
  const todayLogs = completionLogs.filter((log) => isToday(log.completedAt));
  const earnedXpToday = todayLogs.reduce((sum, log) => sum + log.xpAwarded, 0);
  const levelProgress = calculateLevelProgress(profile.totalXp);
  const xpToNextLevel = Math.max(
    0,
    levelProgress.xpForNextLevel - levelProgress.currentXpInLevel,
  );
  const cadenceSummaries = [
    {
      type: 'daily' as const,
      title: 'День',
      emptyText: 'Нет ежедневных квестов',
      remainingText: (remaining: number) => `Осталось ${remaining} на сегодня`,
    },
    {
      type: 'weekly' as const,
      title: 'Неделя',
      emptyText: 'Нет еженедельных квестов',
      remainingText: (remaining: number) => `Осталось ${remaining} на эту неделю`,
    },
    {
      type: 'monthly' as const,
      title: 'Месяц',
      emptyText: 'Нет ежемесячных квестов',
      remainingText: (remaining: number) => `Осталось ${remaining} на этот месяц`,
    },
  ].map((summary) => {
    const matchingQuests = quests.filter(
      (quest) => quest.type === summary.type && !quest.isArchived,
    );
    const completedCount = matchingQuests.filter(
      (quest) => quest.completedInPeriod,
    ).length;
    const remainingCount = Math.max(0, matchingQuests.length - completedCount);
    const percent =
      matchingQuests.length > 0
        ? Math.round((completedCount / matchingQuests.length) * 100)
        : 0;

    return {
      ...summary,
      total: matchingQuests.length,
      completed: completedCount,
      remaining: remainingCount,
      percent,
    };
  });

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Ритм</p>
          <h2>День, неделя и месяц</h2>
        </div>
        <p className="muted-text">
          В одном месте видно, что уже закрыто по текущему ритму и сколько осталось до
          следующего уровня.
        </p>
      </div>

      <div className="today-grid">
        {cadenceSummaries.map((summary, index) => (
          <article
            key={summary.type}
            className={`today-card${index === 0 ? ' today-card--accent' : ''}`}
          >
            <span className="metric-label">{summary.title}</span>
            <strong>{summary.total > 0 ? `${summary.completed}/${summary.total}` : '0/0'}</strong>
            <p className="muted-text">
              {summary.total > 0
                ? summary.remainingText(summary.remaining)
                : summary.emptyText}
            </p>
            <div className="progress-bar today-card__progress" aria-hidden="true">
              <span style={{ width: `${summary.percent}%` }} />
            </div>
          </article>
        ))}

        <article className="today-card">
          <span className="metric-label">Следующий уровень</span>
          <strong>{xpToNextLevel} XP</strong>
          <p className="muted-text">
            До общего уровня {profile.totalLevel + 1}. Сегодня уже получено +{earnedXpToday}
            опыта в {todayLogs.length} отметках.
          </p>
        </article>
      </div>
    </section>
  );
}
