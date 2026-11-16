import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * TextInput
 * Architectural text input with floating-style label and validation feedback.
 */
export const TextInput = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  autoComplete = 'off',
  icon: Icon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={id || name}
          style={{
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: error ? 'var(--color-destructive)' : 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-destructive)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isFocused ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              transition: 'color var(--transition-fast)',
            }}
          >
            <Icon size={16} />
          </div>
        )}

        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            height: '42px',
            backgroundColor: 'var(--color-bg-sunken)',
            border: `1px solid ${
              error
                ? 'var(--color-destructive)'
                : isFocused
                ? 'var(--color-accent-gold)'
                : 'var(--color-border-medium)'
            }`,
            borderRadius: 'var(--radius-sm)',
            paddingLeft: Icon ? '38px' : '14px',
            paddingRight: '14px',
            fontSize: '14px',
            color: 'var(--color-text-primary)',
            outline: 'none',
            boxShadow: isFocused
              ? error
                ? 'var(--shadow-focus-destructive)'
                : 'var(--shadow-focus)'
              : 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          }}
          {...props}
        />
      </div>

      {error ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: 'var(--color-destructive)',
            fontSize: '12px',
            marginTop: '2px',
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

/**
 * PasswordInput
 * Secure password input with visibility toggle and strength-ready styling.
 */
export const PasswordInput = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={id || name}
          style={{
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: error ? 'var(--color-destructive)' : 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-destructive)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={id || name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            height: '42px',
            backgroundColor: 'var(--color-bg-sunken)',
            border: `1px solid ${
              error
                ? 'var(--color-destructive)'
                : isFocused
                ? 'var(--color-accent-gold)'
                : 'var(--color-border-medium)'
            }`,
            borderRadius: 'var(--radius-sm)',
            paddingLeft: '14px',
            paddingRight: '42px',
            fontSize: '14px',
            color: 'var(--color-text-primary)',
            outline: 'none',
            boxShadow: isFocused
              ? error
                ? 'var(--shadow-focus-destructive)'
                : 'var(--shadow-focus)'
              : 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          }}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: 'var(--color-destructive)',
            fontSize: '12px',
            marginTop: '2px',
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

export default { TextInput, PasswordInput };
