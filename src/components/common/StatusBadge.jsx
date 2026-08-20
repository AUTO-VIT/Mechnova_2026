import React from 'react';

export function StatusBadge({ status = 'ACTIVE', label, variant = 'red', pulse = true, className = '' }) {
  const variantClass = { red: 'is-warn', amber: 'is-warn', emerald: 'is-live', cyan: 'is-live', zinc: '' };

  const displayLabel = label || status;
  const currentVariant = variantClass[variant] !== undefined ? variant : 'red';

  return (
    <span
      role="status"
      className={`mn-status ${variantClass[currentVariant]} ${className}`}
    >
      <span
        className={`mn-live-dot ${pulse ? 'animate-pulse' : ''}`}
      />
      <span>{displayLabel}</span>
    </span>
  );
}
