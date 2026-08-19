import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  title = "EXECUTE CRITICAL ACTION",
  message = "This action is immutable and will alter platform state. Confirm execution?",
  confirmLabel = "EXECUTE NOW",
  requireInputMatch = null, // e.g. "REVEAL" or "FINALIZE"
  onConfirm,
  onClose,
  loading = false
}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) setInputValue('');
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmDisabled = requireInputMatch && inputValue.trim() !== requireInputMatch;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a030d]/80 p-4 backdrop-blur-md transition-opacity duration-200"
    >
      <div className="relative w-full max-w-lg transform border border-orange-600 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(234,88,12,0.3)] transition-all duration-200 ease-out scale-100 opacity-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-orange-900/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-orange-500/50 bg-orange-950/60 text-orange-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-mono text-base font-bold uppercase tracking-wider text-orange-400">
                {title}
              </h3>
              <p className="font-mono text-[10px] uppercase text-zinc-500">
                SYSTEM AUDIT PROTOCOL &bull; LEVEL 1 CONFIRMATION
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-zinc-500 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message */}
        <div className="my-5">
          <p className="font-mono text-xs text-zinc-300 leading-relaxed">
            {message}
          </p>

          {requireInputMatch && (
            <div className="mt-4 rounded bg-zinc-900/90 p-3 border border-white/10">
              <label className="block font-mono text-[11px] uppercase text-zinc-400 mb-2">
                Type <span className="font-bold text-orange-400">{requireInputMatch}</span> to authorize execution:
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Type "${requireInputMatch}"`}
                className="w-full border border-zinc-700 bg-[#0a030d] px-3 py-2 font-mono text-sm text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="border border-zinc-700 px-4 py-2 font-mono text-xs font-semibold uppercase text-zinc-400 transition-colors hover:bg-zinc-900 active:scale-[0.97]"
          >
            CANCEL
          </button>
          <button
            type="button"
            disabled={isConfirmDisabled || loading}
            onClick={() => onConfirm()}
            className="bg-orange-600 px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-orange-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {loading ? "PROCESSING..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
