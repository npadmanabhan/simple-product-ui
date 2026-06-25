import { useEffect } from 'react';
import { SpinnerIcon, TriangleAlertIcon } from './icons';

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  isConfirming = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape' && !isConfirming) onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isConfirming, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/40" onClick={!isConfirming ? onCancel : undefined} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in">
        <div className="flex items-start gap-4 mb-6">
          <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-red-50">
            <TriangleAlertIcon className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 id="modal-title" className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isConfirming && <SpinnerIcon className="w-3.5 h-3.5" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
