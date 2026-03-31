import type { CompletionLog, Quest, Stat } from '../types/domain';
import { HistoryList } from '../features/history/HistoryList';

interface HistoryPageProps {
  logs: CompletionLog[];
  quests: Quest[];
  stats: Stat[];
}

export function HistoryPage({ logs, quests, stats }: HistoryPageProps) {
  return (
    <div className="page-stack">
      <HistoryList logs={logs} quests={quests} stats={stats} />
    </div>
  );
}
