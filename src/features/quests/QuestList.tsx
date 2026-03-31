import { useState } from 'react';
import { DIFFICULTY_LABELS } from '../../shared/constants';
import type { CompletionLog, Quest, Stat } from '../../types/domain';
import { calculateQuestStreak } from '../../utils/streaks';
import { formatDateTime } from '../../utils/date';
import {
  canRestoreQuest,
  getQuestCurrentPeriodLabel,
  getQuestTypeLabel,
  getQuestTypeSortOrder,
  isRecurringQuestType,
} from '../../utils/quests';

interface QuestListProps {
  quests: Quest[];
  stats: Stat[];
  completionLogs: CompletionLog[];
  showCompletedCurrentPeriod: boolean;
  enableConfirmations: boolean;
  onComplete: (questId: string) => Promise<boolean>;
  onEdit: (quest: Quest) => void;
  onArchive: (questId: string) => Promise<boolean>;
  onDelete: (questId: string) => Promise<boolean>;
  onRestore: (questId: string) => Promise<boolean>;
}

function sortByActivity(left: Quest, right: Quest) {
  const leftOrder = getQuestTypeSortOrder(left.type);
  const rightOrder = getQuestTypeSortOrder(right.type);

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

export function QuestList({
  quests,
  stats,
  completionLogs,
  showCompletedCurrentPeriod,
  enableConfirmations,
  onComplete,
  onEdit,
  onArchive,
  onDelete,
  onRestore,
}: QuestListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statFilter, setStatFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Quest['type']>('all');
  const statMap = new Map(stats.map((stat) => [stat.key, stat]));
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasFilters =
    normalizedQuery.length > 0 || statFilter !== 'all' || typeFilter !== 'all';

  function resetFilters() {
    setSearchQuery('');
    setStatFilter('all');
    setTypeFilter('all');
  }

  function matchesFilters(quest: Quest) {
    const stat = statMap.get(quest.statKey);
    const searchableText = [
      quest.title,
      quest.description,
      quest.rewardText,
      stat?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesQuery =
      normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);
    const matchesStat =
      statFilter === 'all' || quest.statKey === statFilter;
    const matchesType = typeFilter === 'all' || quest.type === typeFilter;

    return matchesQuery && matchesStat && matchesType;
  }

  const activeQuests = quests
    .filter(
      (quest) =>
        matchesFilters(quest) &&
        !quest.isArchived &&
        !(isRecurringQuestType(quest.type) && quest.completedInPeriod),
    )
    .sort(sortByActivity);

  const completedCurrentPeriodQuests = quests
    .filter(
      (quest) =>
        matchesFilters(quest) &&
        !quest.isArchived &&
        isRecurringQuestType(quest.type) &&
        quest.completedInPeriod,
    )
    .sort(sortByActivity);

  const archivedQuests = quests
    .filter((quest) => matchesFilters(quest) && quest.isArchived)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  const filteredQuestCount = quests.filter(matchesFilters).length;

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

  async function handleRestore(questId: string) {
    if (
      enableConfirmations &&
      !window.confirm('Вернуть квест из архива?')
    ) {
      return;
    }

    await onRestore(questId);
  }

  function renderEmptyState(text: string) {
    return (
      <div className="empty-state">
        <p>{text}</p>
        {hasFilters ? (
          <button type="button" className="ghost-button" onClick={resetFilters}>
            Сбросить фильтры
          </button>
        ) : null}
      </div>
    );
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
              <span className="tag">{getQuestTypeLabel(quest.type)}</span>
              <span className="tag">+{quest.xpReward} опыта</span>
              <span className="tag">{DIFFICULTY_LABELS[quest.difficulty]}</span>
            </div>
          </div>

          <div className="quest-card__actions">
            {!quest.isArchived ? (
              <button
                type="button"
                className="primary-button"
                disabled={isRecurringQuestType(quest.type) && quest.completedInPeriod}
                onClick={() => void onComplete(quest.id)}
              >
                {isRecurringQuestType(quest.type) && quest.completedInPeriod
                  ? `Готово ${getQuestCurrentPeriodLabel(quest.type)}`
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

            {quest.isArchived && canRestoreQuest(quest) ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => void handleRestore(quest.id)}
              >
                Вернуть
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
              Серия: {streak.current} сейчас / {streak.best} лучшая
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
        <div className="section-meta">
          <p className="muted-text">
            Главный сценарий: создать, выполнить, получить прогресс и не потеряться в лишнем.
          </p>
          <p className="muted-text">
            {hasFilters
              ? `Показано ${filteredQuestCount} из ${quests.length} квестов`
              : `Всего квестов: ${quests.length}`}
          </p>
        </div>
      </div>

      <div className="filter-toolbar">
        <div className="filter-toolbar__grid">
          <label className="field">
            <span className="field-label">Поиск</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Название, описание или награда"
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
            <span className="field-label">Тип</span>
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as 'all' | Quest['type'])
              }
            >
              <option value="all">Все типы</option>
              <option value="daily">Ежедневные</option>
              <option value="weekly">Еженедельные</option>
              <option value="monthly">Ежемесячные</option>
              <option value="one_time">Разовые</option>
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

      <div className="quest-section">
        <h3>Активные квесты</h3>
        {activeQuests.length > 0 ? (
          <div className="quest-list">{activeQuests.map((quest) => renderQuestCard(quest))}</div>
        ) : (
          renderEmptyState(
            hasFilters
              ? 'По текущим фильтрам активных квестов не найдено.'
              : 'Активных квестов пока нет. Можно начать с одного маленького шага.',
          )
        )}
      </div>

      {showCompletedCurrentPeriod ? (
        <div className="quest-section">
          <h3>Закрыто в текущем периоде</h3>
          {completedCurrentPeriodQuests.length > 0 ? (
            <div className="quest-list">
              {completedCurrentPeriodQuests.map((quest) => renderQuestCard(quest, true))}
            </div>
          ) : (
            <p className="muted-text">
              {hasFilters
                ? 'По текущим фильтрам закрытых повторяющихся квестов не найдено.'
                : 'В текущем периоде здесь пока пусто.'}
            </p>
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
          <p className="muted-text">
            {hasFilters
              ? 'По текущим фильтрам архив пуст.'
              : 'Архив пока пуст.'}
          </p>
        )}
      </div>
    </section>
  );
}
