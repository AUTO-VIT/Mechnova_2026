import React from 'react';

export function ControlPanel({
  title,
  subtitle,
  badge,
  action,
  children,
  className = '',
  headerClassName = '',
  hazardBorder = false
}) {
  return (
    <section className={`mn-control-panel ${hazardBorder ? 'border-orange-500/40' : ''} ${className}`}>
      {(title || badge || action) && (
        <header className={`mn-control-head ${headerClassName}`}>
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {action}
          </div>
        </header>
      )}
      <div className="mn-control-body">{children}</div>
    </section>
  );
}
