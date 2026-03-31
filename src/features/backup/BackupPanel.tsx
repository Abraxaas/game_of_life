import type { ChangeEvent } from 'react';
import type { AppSettings, StorageKind } from '../../types/domain';
import { formatRelativeBackupTime } from '../../utils/date';

interface ExportPayload {
  fileName: string;
  data: string;
}

interface BackupPanelProps {
  settings: AppSettings;
  storageKind: StorageKind | null;
  onUpdateSettings: (patch: Partial<AppSettings>) => Promise<boolean>;
  onExport: () => Promise<ExportPayload | null>;
  onImport: (rawJson: string) => Promise<boolean>;
}

export function BackupPanel({
  settings,
  storageKind,
  onUpdateSettings,
  onExport,
  onImport,
}: BackupPanelProps) {
  async function handleExport() {
    const payload = await onExport();

    if (!payload) {
      return;
    }

    const blob = new Blob([payload.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = payload.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      settings.enableConfirmations &&
      !window.confirm('Импорт заменит текущие локальные данные. Продолжить?')
    ) {
      event.target.value = '';
      return;
    }

    const text = await file.text();
    await onImport(text);
    event.target.value = '';
  }

  return (
    <div className="backup-layout">
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Резервная копия</p>
            <h2>Экспорт и импорт JSON</h2>
          </div>
          <p className="muted-text">
            Данные сохраняются в браузере пользователя и могут быть перенесены через один JSON-файл.
          </p>
        </div>

        <div className="backup-actions">
          <button type="button" className="primary-button" onClick={() => void handleExport()}>
            Экспортировать данные
          </button>

          <label className="secondary-button file-input-label">
            Импортировать JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => void handleImport(event)}
            />
          </label>
        </div>

        <p className="muted-text">{formatRelativeBackupTime(settings.lastBackupAt)}</p>
        <p className="muted-text">
          Режим хранения: {storageKind === 'indexeddb' ? 'в браузере' : 'временный'}.
        </p>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Настройки</p>
            <h2>Поведение интерфейса</h2>
          </div>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={settings.showCompletedToday}
            onChange={(event) =>
              void onUpdateSettings({
                showCompletedToday: event.target.checked,
              })
            }
          />
          <span>Показывать daily-квесты, выполненные сегодня</span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={settings.enableConfirmations}
            onChange={(event) =>
              void onUpdateSettings({
                enableConfirmations: event.target.checked,
              })
            }
          />
          <span>Показывать подтверждения перед архивом, удалением и импортом</span>
        </label>
      </section>
    </div>
  );
}
