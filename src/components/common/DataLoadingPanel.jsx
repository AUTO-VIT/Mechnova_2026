import React from 'react';
import { Loader2 } from 'lucide-react';

export function DataLoadingPanel({ label = 'Loading the latest data…', className = '' }) {
  return (
    <div className={`mn-empty min-h-60 ${className}`} role="status" aria-live="polite">
      <div>
        <Loader2 className="mn-empty-icon animate-spin p-3" aria-hidden="true" />
        <p className="text-sm text-[var(--mn-muted)]">{label}</p>
      </div>
    </div>
  );
}
