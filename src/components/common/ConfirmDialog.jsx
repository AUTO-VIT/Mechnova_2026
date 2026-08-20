import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ModalLayer } from './ModalLayer';

export function ConfirmDialog({
  isOpen,
  title = 'Confirm this change',
  message = 'Review the details before continuing.',
  confirmLabel = 'Confirm',
  requireInputMatch = null,
  onConfirm,
  onClose,
  loading = false
}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) setInputValue('');
  }, [isOpen]);

  if (!isOpen) return null;
  const isConfirmDisabled = Boolean(requireInputMatch && inputValue.trim() !== requireInputMatch);

  return (
    <ModalLayer labelledBy="confirm-dialog-title" onClose={loading ? undefined : onClose}>
      <div className="mn-panel mn-modal-surface relative w-full max-w-lg border-t-2 border-t-[var(--mn-orange)] p-6">
        <div className="flex items-start justify-between border-b border-[var(--mn-line)] pb-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center border border-orange-500/40 bg-orange-500/10 text-[var(--mn-orange)]"><AlertTriangle className="h-5 w-5" /></div><div><h3 id="confirm-dialog-title" className="font-['Syne'] text-lg font-semibold text-white">{title}</h3><p className="mt-1 text-xs text-[var(--mn-faint)]">Review this change before continuing.</p></div></div>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Close confirmation" className="mn-icon-button h-9 w-9"><X className="h-5 w-5" /></button>
        </div>
        <div className="my-5">
          <p className="text-sm leading-6 text-[#c9cbd0]">{message}</p>
          {requireInputMatch && <label className="mn-field mt-5 border border-[var(--mn-line)] bg-black/20 p-4"><span className="mn-label">Type <strong className="text-[var(--mn-orange)]">{requireInputMatch}</strong> to confirm</span><input type="text" value={inputValue} onChange={(event) => setInputValue(event.target.value)} placeholder={`Type “${requireInputMatch}”`} className="mn-input" autoFocus /></label>}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[var(--mn-line)] pt-4"><button type="button" onClick={onClose} disabled={loading} className="mn-button mn-button-secondary min-h-10">Cancel</button><button type="button" disabled={isConfirmDisabled || loading} onClick={onConfirm} className="mn-button mn-button-danger min-h-10">{loading ? 'Processing…' : confirmLabel}</button></div>
      </div>
    </ModalLayer>
  );
}
