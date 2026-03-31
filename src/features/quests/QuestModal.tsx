import { useEffect, useState, type FormEvent } from 'react';
import { XP_BY_DIFFICULTY } from '../../shared/constants';
import type { Quest, QuestFormValues, Stat } from '../../types/domain';
import { Modal } from '../../components/Modal';

interface QuestModalProps {
  open: boolean;
  quest?: Quest | null;
  stats: Stat[];
  onClose: () => void;
  onSubmit: (values: QuestFormValues) => Promise<boolean>;
}

function getInitialValues(
  stats: Stat[],
  quest?: Quest | null,
): QuestFormValues {
  return {
    title: quest?.title ?? '',
    description: quest?.description ?? '',
    statKey: quest?.statKey ?? stats[0]?.key ?? '',
    type: quest?.type ?? 'daily',
    difficulty: quest?.difficulty ?? 'easy',
    rewardText: quest?.rewardText ?? '',
  };
}

export function QuestModal({
  open,
  quest,
  stats,
  onClose,
  onSubmit,
}: QuestModalProps) {
  const [values, setValues] = useState<QuestFormValues>(getInitialValues(stats, quest));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();

  useEffect(() => {
    if (open) {
      setValues(getInitialValues(stats, quest));
      setFormError(undefined);
      setSubmitting(false);
    }
  }, [open, quest, stats]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.title.trim()) {
      setFormError('Укажите короткое и понятное название квеста.');
      return;
    }

    if (!values.statKey) {
      setFormError('Выберите стат, к которому относится квест.');
      return;
    }

    setSubmitting(true);
    const saved = await onSubmit(values);
    setSubmitting(false);

    if (saved) {
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      title={quest ? 'Редактирование квеста' : 'Новый квест'}
      onClose={onClose}
    >
      <form className="quest-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Название</span>
          <input
            type="text"
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Например, пройти тренировку"
            maxLength={80}
          />
        </label>

        <label className="field">
          <span className="field-label">Описание</span>
          <textarea
            rows={3}
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Опционально: короткий контекст или уточнение"
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Стат</span>
            <select
              value={values.statKey}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  statKey: event.target.value,
                }))
              }
            >
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
              value={values.type}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  type: event.target.value as QuestFormValues['type'],
                }))
              }
            >
              <option value="daily">Ежедневный</option>
              <option value="one_time">Разовый</option>
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Сложность</span>
            <select
              value={values.difficulty}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  difficulty: event.target.value as QuestFormValues['difficulty'],
                }))
              }
            >
              <option value="easy">Easy · 10 XP</option>
              <option value="medium">Medium · 25 XP</option>
              <option value="hard">Hard · 50 XP</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Награда</span>
            <input
              type="text"
              value={values.rewardText}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  rewardText: event.target.value,
                }))
              }
              placeholder="Опционально: кофе, серия, прогулка"
              maxLength={120}
            />
          </label>
        </div>

        <p className="helper-text">
          За выполнение будет начислено {XP_BY_DIFFICULTY[values.difficulty]} XP.
        </p>

        {formError ? <p className="form-error">{formError}</p> : null}

        <div className="modal__actions">
          <button
            type="button"
            className="ghost-button"
            onClick={onClose}
            disabled={submitting}
          >
            Отмена
          </button>
          <button type="submit" className="primary-button" disabled={submitting}>
            {quest ? 'Сохранить квест' : 'Создать квест'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
