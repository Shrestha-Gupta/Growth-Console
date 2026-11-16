import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal
 * Architectural dialog container with warm alabaster surface,
 * backdrop blur scrim, accessible escape handling, and reduced-motion support.
 */
export const Modal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '540px',
}) => {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
          }}
        >
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.05 : 0.2 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(28, 27, 26, 0.45)',
              backdropFilter: 'blur(3px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            data-lenis-prevent="true"
            className="scrollable-nested"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: shouldReduceMotion ? 0.08 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              maxWidth,
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-modal)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                backgroundColor: 'var(--color-bg-surface)',
              }}
            >
              <div>
                <h3
                  id="modal-title"
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    letterSpacing: '-0.01em',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
                {subtitle && (
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      marginTop: '4px',
                      margin: 0,
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                style={{
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: 'var(--radius-xs)',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div
              data-lenis-prevent="true"
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
