import { useEffect, useState, type FormEvent } from 'react';
import type { StorageKind, UserProfile } from '../../types/domain';

interface ProfileSummaryProps {
  profile: UserProfile;
  storageKind: StorageKind | null;
  onUpdateUsername: (username: string) => Promise<boolean>;
}

export function ProfileSummary({
  profile,
  storageKind,
  onUpdateUsername,
}: ProfileSummaryProps) {
  const [draftName, setDraftName] = useState(profile.username ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftName(profile.username ?? '');
  }, [profile.username]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onUpdateUsername(draftName);
    setSaving(false);
  }

  return (
    <section className="panel profile-panel">
      <div className="profile-panel__heading">
        <div>
          <p className="eyebrow">Профиль</p>
          <h2>{profile.username || 'Локальный герой'}</h2>
        </div>
        <span className={`storage-pill storage-pill--${storageKind ?? 'memory'}`}>
          {storageKind === 'indexeddb'
            ? 'Сохранение в браузере'
            : 'Временное хранение'}
        </span>
      </div>

      <div className="profile-stats">
        <div>
          <span className="metric-label">Общий уровень</span>
          <strong>{profile.totalLevel}</strong>
        </div>
        <div>
          <span className="metric-label">Суммарный опыт</span>
          <strong>{profile.totalXp}</strong>
        </div>
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <label htmlFor="username" className="field-label">
          Псевдоним
        </label>
        <div className="inline-form__row">
          <input
            id="username"
            type="text"
            maxLength={32}
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Например, Дмитрий"
          />
          <button type="submit" className="primary-button" disabled={saving}>
            Сохранить
          </button>
        </div>
      </form>
    </section>
  );
}
