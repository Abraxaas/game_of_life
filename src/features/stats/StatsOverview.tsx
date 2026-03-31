import type { Stat } from '../../types/domain';
import { calculateLevelProgress, calculateProgressPercent } from '../../utils/xp';

interface StatsOverviewProps {
  stats: Stat[];
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Статы</p>
          <h2>Жизненные направления</h2>
        </div>
        <p className="muted-text">
          Каждый выполненный квест усиливает связанный стат и двигает общий прогресс.
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => {
          const progress = calculateLevelProgress(stat.xp);
          const percent = calculateProgressPercent(stat.xp);

          return (
            <article key={stat.id} className="stat-card">
              <div className="stat-card__header">
                <span className="stat-card__icon" aria-hidden="true">
                  {stat.icon}
                </span>
                <div>
                  <h3>{stat.name}</h3>
                  <p>Уровень {progress.level}</p>
                </div>
              </div>

              <div className="progress-bar" aria-hidden="true">
                <span style={{ width: `${percent}%` }} />
              </div>

              <div className="stat-card__footer">
                <span>{progress.currentXpInLevel} XP в текущем уровне</span>
                <strong>{progress.xpForNextLevel} XP до следующего</strong>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
