import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  itemName,
  description = 'Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan penghapusan data ini dari sistem?',
  confirmLabel = 'Hapus Sekarang',
  cancelLabel = 'Batal',
  isLoading = false,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const [isGenieSucking, setIsGenieSucking] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsGenieSucking(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isGenieSucking || isLoading) return;
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const handleGenieConfirm = () => {
    if (isGenieSucking || isLoading) return;
    setIsGenieSucking(true);
    window.setTimeout(() => {
      onConfirm();
      setIsGenieSucking(false);
    }, 450);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading && !isGenieSucking) {
        if (onCancel) onCancel();
        else if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, isGenieSucking, onCancel, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#42368E]/42 backdrop-blur-md p-4 animate-fade-in"
      onClick={() => {
        if (!isLoading && !isGenieSucking) handleClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-[#7468C4]/30 bg-white/95 p-6 shadow-2xl dark:border-[#9E92FF]/28 dark:bg-[#1E1A3E]/95 backdrop-blur-2xl animate-wobble-in"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="flex items-start justify-between">
          {/* Interactive Genie Bin Icon Badge */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 ring-4 ring-rose-500/15">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 overflow-visible"
              >
                <g className={isGenieSucking ? 'animate-genie-lid-open' : ''}>
                  <path d="M3 6h18" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </g>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              {isGenieSucking && (
                <span className="pointer-events-none absolute -bottom-1 h-1.5 w-7 rounded-full bg-rose-500/40 blur-[2px] animate-ping" />
              )}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isLoading || isGenieSucking}
            className="no-ornament rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:opacity-50 cursor-pointer"
            title="Tutup dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 id="delete-dialog-title" className="text-base font-extrabold text-slate-900 dark:text-white">
            {title}
          </h3>
          {itemName && (
            <div
              className={`mt-2.5 rounded-xl bg-rose-50/85 p-3 border border-rose-200/75 dark:bg-rose-950/50 dark:border-rose-900/60 transition-all ${
                isGenieSucking ? 'animate-genie-card-pull' : ''
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 dark:text-rose-400 block">
                {isGenieSucking ? 'Menyedot ke Genie Bin...' : 'Target Data Dihapus'}
              </span>
              <p className="mt-0.5 text-xs font-bold text-rose-800 dark:text-rose-200 break-words">
                {itemName}
              </p>
            </div>
          )}
          <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading || isGenieSucking}
            className="no-ornament inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleGenieConfirm}
            disabled={isLoading || isGenieSucking}
            className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 whitespace-nowrap shrink-0 disabled:opacity-60 transition-all cursor-pointer"
          >
            {isLoading || isGenieSucking ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <Trash2 className="h-4 w-4 shrink-0" />
            )}
            <span>{isGenieSucking ? 'Menghapus...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

