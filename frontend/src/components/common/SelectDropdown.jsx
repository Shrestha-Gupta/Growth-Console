import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * SelectDropdown
 * Accessible custom dropdown with antique gold highlights.
 * Refined for performance: scoped event listeners and reduced-motion compliance.
 */
export const SelectDropdown = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error = '',
  width = '100%',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Attach outside click listener ONLY when open to prevent continuous event listening
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', flexDirection: 'column', gap: '6px', width }}
    >
      {label && (
        <span
          style={{
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: error ? 'var(--color-destructive)' : 'var(--color-text-secondary)',
          }}
        >
          {label}
        </span>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          style={{
            width: '100%',
            height: '42px',
            backgroundColor: 'var(--color-bg-sunken)',
            border: `1px solid ${
              error
                ? 'var(--color-destructive)'
                : isOpen
                ? 'var(--color-accent-gold)'
                : 'var(--color-border-medium)'
            }`,
            borderRadius: 'var(--radius-sm)',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: isOpen ? 'var(--shadow-focus)' : 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            outline: 'none',
          }}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown
            size={16}
            style={{
              color: 'var(--color-text-muted)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform var(--transition-fast)',
            }}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              data-lenis-prevent="true"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.99 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 4, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.99 }}
              transition={{ duration: shouldReduceMotion ? 0.08 : 0.15 }}
              role="listbox"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-elevated)',
                maxHeight: '220px',
                overflowY: 'auto',
                padding: '4px',
              }}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      backgroundColor: isSelected
                        ? 'var(--color-accent-gold-soft)'
                        : 'transparent',
                      fontWeight: isSelected ? '500' : '400',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={14} color="var(--color-accent-gold)" />}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-destructive)' }}>{error}</span>
      )}
    </div>
  );
};

export default SelectDropdown;
