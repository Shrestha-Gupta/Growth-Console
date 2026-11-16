import React from 'react';

/**
 * BrandLogo
 * Architectural emblem and logotype for Growth Console / Growth Tech India.
 */
export const BrandLogo = ({ variant = 'light', collapsed = false }) => {
  const isDark = variant === 'dark';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
      {/* Geometric Hexagonal Emblem */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: isDark ? 'var(--color-bg-base)' : 'var(--color-accent-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <span
          style={{
            fontFamily: 'inherit',
            fontWeight: '700',
            fontSize: '14px',
            color: isDark ? 'var(--color-bg-dark)' : 'var(--color-text-primary)',
            letterSpacing: '-0.05em',
          }}
        >
          G
        </span>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: isDark ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}
          >
            Growth Console
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: '500',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isDark ? 'var(--color-accent-champagne)' : 'var(--color-text-muted)',
              lineHeight: 1.2,
            }}
          >
            Growth Tech India
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
