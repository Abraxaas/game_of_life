import type { ToastMessage } from '../types/domain';

interface ToastViewportProps {
  toasts: ToastMessage[];
  onDismiss: (toastId: string) => void;
}

export function ToastViewport({
  toasts,
  onDismiss,
}: ToastViewportProps) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.tone}`}
        >
          <p>{toast.text}</p>
          <button
            type="button"
            className="ghost-button ghost-button--small"
            onClick={() => onDismiss(toast.id)}
            aria-label="Скрыть уведомление"
          >
            OK
          </button>
        </div>
      ))}
    </div>
  );
}
