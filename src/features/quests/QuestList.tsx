import type { CompletionLog, Quest, Stat } from '../../types/domain';
import { calculateQuestStreak } from '../../utils/streaks';
import { formatDateTime } from '../../utils/date';

interface QuestListProps {
  quests: Quest[];
  stats: Stat[];
  completionLogs: CompletionLog[];
  showCompletedToday: boolean;
  enableConfirmations: boolean;
  onComplete: (questId: string) => Promise<boolean>;
  onEdit: (quest: Quest) => void;
  onArchive: (questId: string) => Promise<boolean>;
  onDelete: (questId: string) => Promise<boolean>;
}

function sortByActivity(left: Quest, right: Quest) {
  if (left.type !== right.type) {
    return left.type === 'daily' ? -1 : 1;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

export function QuestList({
  quests,
  stats,
  completionLogs,
  showCompletedToday,
  enableConfirmations,
  onComplete,
  onEdit,
  onArchive,
  onDelete,
}: QuestListProps) {
  const statMap = new Map(stats.map((stat) => [stat.key, stat]));

  const activeQuests = quests
    .filter((quest) => !quest.isArchived && !(quest.type === 'daily' && quest.completedToday))
    .sort(sortByActivity);

  const completedTodayQuests = quests
    .filter((quest) => !quest.isArchived && quest.type === 'daily' && quest.completedToday)
    .sort(sortByActivity);

  const archivedQuests = quests
    .filter((quest) => quest.isArchived)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  async function handleDelete(questId: string) {
    if (
      enableConfirmations &&
      !window.confirm('Удалить квест и связанную историю выполнений?')
    ) {
      return;
    }

    await onDelete(questId);
  }

  async function handleArchive(questId: string) {
    if (
      enableConfirmations &&
      !window.confirm('Перенести квест в архив?')
    ) {
      return;
    }

    await onArchive(questId);
  }

  function renderQuestCard(quest: Quest, subdued = false) {
    const stat = statMap.get(quest.statKey);
    const streak =
      quest.type === 'daily'
        ? calculateQuestStreak(completionLogs, quest.id)
        : { current: 0, best: 0 };

    return (
      <article
        key={quest.id}
        className={`quest-card${subdued ? ' quest-card--subdued' : ''}`}
      >
        <div className="quest-card__header">
          <div>
            <h3>{quest.title}</h3>
            <div className="quest-card__badges">
              <span className="tag">{stat?.icon ?? '•'} {stat?.name ?? quest.statKey}</span>
              <span className="tag">{quest.type === 'daily' ? 'Daily' : 'One-time'}</span>
              <span className="tag">+{quest.xpReward} XP</span>
              <span className="tag">{quest.difficulty}</span>
            </div>
          </div>

          <div className="quest-card__actions">
            {!quest.isArchived ? (
              <button
                type="button"
                className="primary-button"
                disabled={quest.type === 'daily' && quest.completedToday}
                onClick={() => void onComplete(quest.id)}
              >
                {quest.type === 'daily' && quest.completedToday
                  ? 'На сегодня готово'
                  : 'Выполнить'}
              </button>
            ) : null}

            {!quest.isArchived ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => onEdit(quest)}
              >
                Изменить
              </button>
            ) : null}

            {!quest.isArchived ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => void handleArchive(quest.id)}
              >
                В архив
              </button>
            ) : null}

            <button
              type="button"
              className="ghost-button"
              onClick={() => void handleDelete(quest.id)}
            >
              Удалить
            </button>
          </div>
        </div>

        {quest.description ? <p className="quest-card__description">{quest.description}</p> : null}

        <div className="quest-card__footer">
          <span>Выполнений: {quest.timesCompleted}</span>
          {quest.type === 'daily' ? (
            <span>
              Streak: {streak.current} сейчас / {streak.best} лучший
            </span>
          ) : null}
          <span>Последний раз: {formatDateTime(quest.lastCompletedAt)}</span>
        </div>

        {quest.rewardText ? (
          <p className="quest-card__reward">Награда: {quest.rewardText}</p>
        ) : null}
      </article>
    );
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Квесты</p>
          <h2>Активный список</h2>
        </div>
        <p className="muted-text">
          Главный сценарий: создать, выполнить, получить прогресс и не потеряться в лишнем.
        </p>
      </div>

      <div className="quest-section">
        <h3>Активные квесты</h3>
        {activeQuests.length > 0 ? (
          <div className="quest-list">{activeQuests.map((quest) => renderQuestCard(quest))}</div>
        ) : (
          <div className="empty-state">
            <p>Активных квестов пока нет. Можно начать с одного маленького шага.</p>
          </div>
        )}
      </div>

      {showCompletedToday ? (
        <div className="quest-section">
          <h3>Выполнено сегодня</h3>
          {completedTodayQuests.length > 0 ? (
            <div className="quest-list">
              {completedTodayQuests.map((quest) => renderQuestCard(quest, true))}
            </div>
          ) : (
            <p className="muted-text">Сегодня здесь пока пусто.</p>
          )}
        </div>
      ) : null}

      <div className="quest-section">
        <h3>Архив</h3>
        {archivedQuests.length > 0 ? (
          <div className="quest-list">
            {archivedQuests.map((quest) => renderQuestCard(quest, true))}
          </div>
        ) : (
          <p className="muted-text">Архив пока пуст.</p>
        )}
      </div>
    </section>
  );
}
