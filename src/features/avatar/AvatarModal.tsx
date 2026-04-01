import { useEffect, useState, type FormEvent } from 'react';
import {
  AVATAR_BEARD_STYLE_OPTIONS,
  AVATAR_EYE_COLOR_OPTIONS,
  AVATAR_GENDER_OPTIONS,
  AVATAR_HAIR_COLOR_OPTIONS,
  AVATAR_HAIR_STYLE_OPTIONS,
  AVATAR_SKIN_TONE_OPTIONS,
  DEFAULT_AVATAR_VALUES,
} from '../../shared/avatarConfig';
import type {
  AvatarFormValues,
  AvatarProfile,
} from '../../types/domain';
import { Modal } from '../../components/Modal';

interface AvatarModalProps {
  open: boolean;
  avatar: AvatarProfile | null;
  onClose: () => void;
  onSubmit: (values: AvatarFormValues) => Promise<boolean>;
}

function getInitialValues(avatar: AvatarProfile | null): AvatarFormValues {
  if (!avatar) {
    return DEFAULT_AVATAR_VALUES;
  }

  return {
    gender: avatar.gender,
    skinTone: avatar.skinTone,
    eyeColor: avatar.eyeColor,
    hairColor: avatar.hairColor,
    hairStyle: avatar.hairStyle,
    beardStyle: avatar.beardStyle,
  };
}

export function AvatarModal({
  open,
  avatar,
  onClose,
  onSubmit,
}: AvatarModalProps) {
  const [values, setValues] = useState<AvatarFormValues>(getInitialValues(avatar));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(getInitialValues(avatar));
      setSubmitting(false);
    }
  }, [avatar, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      title={avatar ? 'Редактирование аватара' : 'Создание аватара'}
      onClose={onClose}
    >
      <form className="quest-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span className="field-label">Пол</span>
            <select
              value={values.gender}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  gender: event.target.value as AvatarFormValues['gender'],
                }))
              }
            >
              {AVATAR_GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Цвет кожи</span>
            <select
              value={values.skinTone}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  skinTone: event.target.value as AvatarFormValues['skinTone'],
                }))
              }
            >
              {AVATAR_SKIN_TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Цвет глаз</span>
            <select
              value={values.eyeColor}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  eyeColor: event.target.value as AvatarFormValues['eyeColor'],
                }))
              }
            >
              {AVATAR_EYE_COLOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Цвет волос</span>
            <select
              value={values.hairColor}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  hairColor: event.target.value as AvatarFormValues['hairColor'],
                }))
              }
            >
              {AVATAR_HAIR_COLOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Прическа</span>
            <select
              value={values.hairStyle}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  hairStyle: event.target.value as AvatarFormValues['hairStyle'],
                }))
              }
            >
              {AVATAR_HAIR_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Борода</span>
            <select
              value={values.beardStyle}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  beardStyle: event.target.value as AvatarFormValues['beardStyle'],
                }))
              }
            >
              {AVATAR_BEARD_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="helper-text">
          Внешний вид будет дальше автоматически усиливаться от статов на 5 / 10 / 20 уровне.
        </p>

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
            {avatar ? 'Сохранить аватар' : 'Создать аватар'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
