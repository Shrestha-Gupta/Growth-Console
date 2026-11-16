import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * PrimaryButton
 * Antique Gold action button with hover depth and loading spinner support.
 */
export const PrimaryButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  isLoading = false,
  icon: Icon,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading && !shouldReduceMotion ? { translateY: -1 } : {}}
      whileTap={!disabled && !isLoading && !shouldReduceMotion ? { scale: 0.98 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
      style={{
        backgroundColor: disabled ? 'var(--color-bg-sunken)' : 'var(--color-accent-gold)',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
        border: `1px solid ${disabled ? 'var(--color-border)' : 'var(--color-accent-gold-hover)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '0 var(--space-4)',
        height: '40px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        fontFamily: 'inherit',
        fontSize: '13px',
        fontWeight: '500',
        letterSpacing: '0.03em',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : 'var(--shadow-subtle)',
        width: fullWidth ? '100%' : 'auto',
        transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
        userSelect: 'none',
      }}
      className={`btn-primary ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid var(--color-text-primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : Icon ? (
        <Icon size={16} strokeWidth={2} />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
};

/**
 * SecondaryButton
 * Architectural outlined button in muted taupe / charcoal.
 */
export const SecondaryButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  icon: Icon,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        !disabled
          ? shouldReduceMotion
            ? { backgroundColor: 'var(--color-bg-elevated)' }
            : { backgroundColor: 'var(--color-bg-elevated)', translateY: -1 }
          : {}
      }
      whileTap={!disabled && !shouldReduceMotion ? { scale: 0.98 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
      style={{
        backgroundColor: 'transparent',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
        border: '1px solid var(--color-border-medium)',
        borderRadius: 'var(--radius-sm)',
        padding: '0 var(--space-4)',
        height: '40px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        fontFamily: 'inherit',
        fontSize: '13px',
        fontWeight: '500',
        letterSpacing: '0.03em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
      }}
      className={`btn-secondary ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2} />}
      <span>{children}</span>
    </motion.button>
  );
};

/**
 * DestructiveButton
 * Outlined button in muted crimson for permanent actions with deliberate visual caution.
 */
export const DestructiveButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  isLoading = false,
  icon: Icon,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { backgroundColor: 'rgba(155, 61, 61, 0.08)' } : {}}
      whileTap={!disabled && !isLoading && !shouldReduceMotion ? { scale: 0.98 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
      style={{
        backgroundColor: 'transparent',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-destructive)',
        border: `1px solid ${disabled ? 'var(--color-border)' : 'var(--color-destructive)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '0 var(--space-4)',
        height: '40px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        fontFamily: 'inherit',
        fontSize: '13px',
        fontWeight: '500',
        letterSpacing: '0.03em',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
      }}
      className={`btn-destructive ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid var(--color-destructive)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : Icon ? (
        <Icon size={16} strokeWidth={2} />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
};

export default { PrimaryButton, SecondaryButton, DestructiveButton };
