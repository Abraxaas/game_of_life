import { useState } from 'react';
import type {
  AvatarFormValues,
  AvatarProfile,
  Stat,
} from '../../types/domain';
import { getAvatarStage, getDominantStatKey } from '../../utils/avatar';
import { AvatarModal } from './AvatarModal';
import { AvatarPreview } from './AvatarPreview';

interface AvatarPanelProps {
  avatar: AvatarProfile | null;
  stats: Stat[];
  onSaveAvatar: (values: AvatarFormValues) => Promise<boolean>;
}

export function AvatarPanel({
  avatar,
  stats,
  onSaveAvatar,
}: AvatarPanelProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const dominantStatKey = getDominantStatKey(stats);
  const dominantStat = stats.find((stat) => stat.key === dominantStatKey) ?? stats[0];

  return (
    <section className="panel avatar-panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Аватар</p>
          <h2>Визуальный образ героя</h2>
        </div>
        <button
          type="button"
          className={avatar ? 'secondary-button' : 'primary-button'}
          onClick={() => setModalOpen(true)}
        >
          {avatar ? 'Редактировать' : 'Создать аватар'}
        </button>
      </div>

      <div className="avatar-panel__layout">
        {avatar ? (
          <AvatarPreview avatar={avatar} stats={stats} />
        ) : (
          <div className="avatar-panel__placeholder">
            <div className="avatar-panel__placeholder-head" />
            <div className="avatar-panel__placeholder-body" />
          </div>
        )}

        <div className="avatar-panel__content">
          {avatar ? (
            <>
              <p className="muted-text">
                Базовая внешность настраивается вручную, а детали образа усиливаются
                автоматически по статам.
              </p>
              <p className="muted-text">
                Сейчас сильнее всего влияет стат: {dominantStat?.icon} {dominantStat?.name}.
              </p>

              <div className="avatar-panel__chips">
                {stats.map((stat) => (
                  <div key={stat.id} className="avatar-panel__chip">
                    <span>{stat.icon} {stat.name}</span>
                    <strong>этап {getAvatarStage(stat.level)}/3</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3>Аватар еще не создан</h3>
              <p className="muted-text">
                Создайте базовый образ один раз, а затем аватар будет сам визуально
                прокачиваться от ваших статов.
              </p>
              <p className="muted-text">
                Апгрейды открываются на 5 / 10 / 20 уровне для здоровья, дисциплины,
                порядка, финансов и социализации.
              </p>
            </>
          )}
        </div>
      </div>

      <AvatarModal
        open={isModalOpen}
        avatar={avatar}
        onClose={() => setModalOpen(false)}
        onSubmit={onSaveAvatar}
      />
    </section>
  );
}
