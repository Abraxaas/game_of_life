import type { CompletionLog, StreakSummary } from '../types/domain';
import { addDaysToDateKey, toDateKey } from './date';

function getSortedUniqueQuestDateKeys(logs: CompletionLog[], questId: string) {
  return Array.from(
    new Set(
      logs
        .filter((log) => log.questId === questId)
        .map((log) => toDateKey(log.completedAt)),
    ),
  ).sort();
}

export function calculateQuestStreak(
  logs: CompletionLog[],
  questId: string,
): StreakSummary {
  const dateKeys = getSortedUniqueQuestDateKeys(logs, questId);

  if (dateKeys.length === 0) {
    return { current: 0, best: 0 };
  }

  let best = 1;
  let streak = 1;

  for (let index = 1; index < dateKeys.length; index += 1) {
    const previousKey = dateKeys[index - 1];
    const currentKey = dateKeys[index];

    if (currentKey === addDaysToDateKey(previousKey, 1)) {
      streak += 1;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  const todayKey = toDateKey(new Date());
  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  const latestKey = dateKeys[dateKeys.length - 1];

  if (latestKey !== todayKey && latestKey !== yesterdayKey) {
    return { current: 0, best };
  }

  let current = 1;

  for (let index = dateKeys.length - 1; index > 0; index -= 1) {
    const currentKey = dateKeys[index];
    const previousKey = dateKeys[index - 1];

    if (currentKey === addDaysToDateKey(previousKey, 1)) {
      current += 1;
    } else {
      break;
    }
  }

  return { current, best };
}
