import { QUEST_TYPE_LABELS } from '../shared/constants';
import type { Quest, QuestType } from '../types/domain';
import { isSameMonth, isSameWeek, isToday } from './date';

export function isQuestType(value: unknown): value is QuestType {
  return (
    value === 'daily' ||
    value === 'weekly' ||
    value === 'monthly' ||
    value === 'one_time'
  );
}

export function isRecurringQuestType(
  type: QuestType,
): type is Exclude<QuestType, 'one_time'> {
  return type === 'daily' || type === 'weekly' || type === 'monthly';
}

export function isQuestCompletedInCurrentPeriod(
  type: QuestType,
  lastCompletedAt?: string,
) {
  if (!lastCompletedAt) {
    return false;
  }

  if (type === 'daily') {
    return isToday(lastCompletedAt);
  }

  if (type === 'weekly') {
    return isSameWeek(lastCompletedAt, new Date().toISOString());
  }

  if (type === 'monthly') {
    return isSameMonth(lastCompletedAt, new Date().toISOString());
  }

  return false;
}

export function getQuestTypeSortOrder(type: QuestType) {
  switch (type) {
    case 'daily':
      return 0;
    case 'weekly':
      return 1;
    case 'monthly':
      return 2;
    case 'one_time':
    default:
      return 3;
  }
}

export function canRestoreQuest(
  quest: Pick<Quest, 'type' | 'timesCompleted'>,
) {
  return isRecurringQuestType(quest.type) || quest.timesCompleted === 0;
}

export function getQuestTypeLabel(type: QuestType) {
  return QUEST_TYPE_LABELS[type];
}

export function getQuestCurrentPeriodLabel(type: QuestType) {
  switch (type) {
    case 'daily':
      return 'сегодня';
    case 'weekly':
      return 'на этой неделе';
    case 'monthly':
      return 'в этом месяце';
    case 'one_time':
    default:
      return 'один раз';
  }
}
