import React from 'react';

/**
 * StatusPill
 * Renders standardized account status chips (active, inactive, suspended)
 * and role badges. Strictly excludes green in accordance with the Royal Ivory specification.
 */
export const StatusPill = ({ status = 'active', type = 'status' }) => {
  const normalized = String(status).toLowerCase();

  // Role Badge Variant
  if (type === 'role') {
    const isAdmin = normalized === 'admin';
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          backgroundColor: isAdmin ? 'var(--color-accent-gold-soft)' : 'var(--color-bg-sunken)',
          border: `1px solid ${isAdmin ? 'var(--color-accent-gold)' : 'var(--color-border)'}`,
          color: isAdmin ? 'var(--color-text-gold)' : 'var(--color-text-secondary)',
          lineHeight: '16px',
        }}
      >
        {normalized}
      </span>
    );
  }

  // Standardized Account Status Variants
  const configs = {
    active: {
      bg: 'var(--color-status-active-bg)',
      border: 'var(--color-status-active-border)',
      text: 'var(--color-status-active-text)',
      dot: 'var(--color-status-active-dot)',
      label: 'Active',
      isHollow: false,
    },
    inactive: {
      bg: 'var(--color-status-inactive-bg)',
      border: 'var(--color-status-inactive-border)',
      text: 'var(--color-status-inactive-text)',
      dot: 'var(--color-status-inactive-dot)',
      label: 'Inactive',
      isHollow: true,
    },
    suspended: {
      bg: 'var(--color-status-suspended-bg)',
      border: 'var(--color-status-suspended-border)',
      text: 'var(--color-status-suspended-text)',
      dot: 'var(--color-status-suspended-dot)',
      label: 'Suspended',
      isHollow: false,
    },
  };

  const current = configs[normalized] || configs.inactive;

  return (
    <span
      role="status"
      aria-label={`Account status: ${current.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        color: current.text,
        userSelect: 'none',
        lineHeight: '16px',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: current.isHollow ? 'transparent' : current.dot,
          border: `1.5px solid ${current.dot}`,
          display: 'inline-block',
        }}
      />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusPill;
