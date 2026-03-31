import type { AppSettings, StorageKind } from '../types/domain';
import { BackupPanel } from '../features/backup/BackupPanel';

interface ExportPayload {
  fileName: string;
  data: string;
}

interface BackupPageProps {
  settings: AppSettings;
  storageKind: StorageKind | null;
  onUpdateSettings: (patch: Partial<AppSettings>) => Promise<boolean>;
  onExport: () => Promise<ExportPayload | null>;
  onImport: (rawJson: string) => Promise<boolean>;
}

export function BackupPage({
  settings,
  storageKind,
  onUpdateSettings,
  onExport,
  onImport,
}: BackupPageProps) {
  return (
    <div className="page-stack">
      <BackupPanel
        settings={settings}
        storageKind={storageKind}
        onUpdateSettings={onUpdateSettings}
        onExport={onExport}
        onImport={onImport}
      />
    </div>
  );
}
