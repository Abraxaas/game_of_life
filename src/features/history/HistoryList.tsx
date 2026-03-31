import { useState } from 'react';
import type { CompletionLog, Quest, Stat } from '../../types/domain';
import { formatDateTime, isToday } from '../../utils/date';

interface HistoryListProps {
  logs: CompletionLog[];
  quests: Quest[];
  stats: Stat[];
}

type PeriodFilter = 'all' | 'today' | '7d' | '30d';

export function HistoryList({ logs, quests, stats }: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statFilter, setStatFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const questMap = new Map(quests.map((quest) => [quest.id, quest]));
  const statMap = new Map(stats.map((stat) => [stat.key, stat]));
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasFilters =
    normalizedQuery.length > 0 || statFilter !== 'all' || periodFilter !== 'all';

  function resetFilters() {
    setSearchQuery('');
    setStatFilter('all');
    setPeriodFilter('all');
  }

  function matchesPeriod(log: CompletionLog) {
    if (periodFilter === 'all') {
      return true;
    }

    if (periodFilter === 'today') {
      return isToday(log.completedAt);
    }

    const days = periodFilter === '7d' ? 7 : 30;
    const threshold = new Date();
    threshold.setHours(0, 0, 0, 0);
    threshold.setDate(threshold.getDate() - (days - 1));

    return new Date(log.completedAt).getTime() >= threshold.getTime();
  }

  const filteredLogs = logs.filter((log) => {
    const quest = questMap.get(log.questId);
    const stat = statMap.get(log.statKey);
    const searchableText = [quest?.title, stat?.name, log.note]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);
    const matchesStat =
      statFilter === 'all' || log.statKey === statFilter;

    return matchesQuery && matchesStat && matchesPeriod(log);
  });
  const filteredXp = filteredLogs.reduce((sum, log) => sum + log.xpAwarded, 0);

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">История</p>
          <h2>Последние выполнения</h2>
        </div>
        <div className="section-meta">
          <p className="muted-text">
            Здесь видно, как реальная рутина превращается в накопленный прогресс.
          </p>
          <p className="muted-text">
            {hasFilters
              ? `Показано ${filteredLogs.length} из ${logs.length} записей · +${filteredXp} опыта`
              : `Всего записей: ${logs.length} · +${filteredXp} опыта`}
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <p>История появится после первого выполненного квеста.</p>
        </div>
      ) : (
        <>
          <div className="filter-toolbar">
            <div className="filter-toolbar__grid">
              <label className="field">
                <span className="field-label">Поиск</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Квест или стат"
                />
              </label>

              <label className="field">
                <span className="field-label">Стат</span>
                <select
                  value={statFilter}
                  onChange={(event) => setStatFilter(event.target.value)}
                >
                  <option value="all">Все статы</option>
                  {stats.map((stat) => (
                    <option key={stat.id} value={stat.key}>
                      {stat.icon} {stat.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field-label">Период</span>
                <select
                  value={periodFilter}
                  onChange={(event) =>
                    setPeriodFilter(event.target.value as PeriodFilter)
                  }
                >
                  <option value="all">Все время</option>
                  <option value="today">Только сегодня</option>
                  <option value="7d">Последние 7 дней</option>
                  <option value="30d">Последние 30 дней</option>
                </select>
              </label>
            </div>

            {hasFilters ? (
              <div className="filter-toolbar__actions">
                <button type="button" className="ghost-button" onClick={resetFilters}>
                  Сбросить фильтры
                </button>
              </div>
            ) : null}
          </div>

          {filteredLogs.length === 0 ? (
            <div className="empty-state">
              <p>По текущим фильтрам записи не найдены.</p>
              <button type="button" className="ghost-button" onClick={resetFilters}>
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="history-list">
              {filteredLogs.map((log) => {
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
        </>
      )}
    </section>
  );
}
