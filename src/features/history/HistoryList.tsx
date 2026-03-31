import type { CompletionLog, Quest, Stat } from '../../types/domain';
import { formatDateTime } from '../../utils/date';

interface HistoryListProps {
  logs: CompletionLog[];
  quests: Quest[];
  stats: Stat[];
}

export function HistoryList({ logs, quests, stats }: HistoryListProps) {
  const questMap = new Map(quests.map((quest) => [quest.id, quest]));
  const statMap = new Map(stats.map((stat) => [stat.key, stat]));

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">История</p>
          <h2>Последние выполнения</h2>
        </div>
        <p className="muted-text">
          Здесь видно, как реальная рутина превращается в накопленный прогресс.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <p>История появится после первого выполненного квеста.</p>
        </div>
      ) : (
        <div className="history-list">
          {logs.map((log) => {
            const quest = questMap.get(log.questId);
            const stat = statMap.get(log.statKey);

            return (
              <article key={log.id} className="history-row">
                <div>
                  <strong>{quest?.title ?? 'Удаленный квест'}</strong>
                  <p>
                    {stat?.icon ?? '•'} {stat?.name ?? log.statKey}
                  </p>
                </div>

                <div className="history-row__meta">
                  <span>{formatDateTime(log.completedAt)}</span>
                  <strong>+{log.xpAwarded} опыта</strong>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
