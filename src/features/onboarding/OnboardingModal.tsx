import { Modal } from '../../components/Modal';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  return (
    <Modal open={open} title="Как работает Игра жизни" onClose={onClose}>
      <div className="onboarding-stack">
        <p>
          Это спокойный личный трекер рутины в формате RPG: вы отмечаете полезные
          действия, получаете опыт и постепенно прокачиваете жизненные направления.
        </p>

        <ol className="onboarding-list">
          <li>Квест связывается со статом и сложностью, чтобы опыт шел в нужное направление.</li>
          <li>
            Повторяющиеся квесты бывают ежедневными, еженедельными и ежемесячными,
            а разовые закрываются один раз и уходят в архив.
          </li>
          <li>
            После выполнения вы сразу видите прогресс, историю и при необходимости
            можете отменить последнее действие.
          </li>
          <li>
            Лучше начинать с 4-6 спокойных квестов, чтобы система поддерживала ритм, а
            не перегружала.
          </li>
        </ol>

        <p className="muted-text">
          Идея простая: меньше давления, больше понятного накопления маленьких побед.
        </p>

        <div className="modal__actions">
          <button type="button" className="primary-button" onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </Modal>
  );
}
