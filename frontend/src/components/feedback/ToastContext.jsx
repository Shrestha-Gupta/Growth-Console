import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const shouldReduceMotion = useReducedMotion();

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100% - 48px)',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: shouldReduceMotion ? 0.08 : 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                pointerEvents: 'auto',
                backgroundColor: 'var(--color-bg-surface)',
                border: `1px solid ${
                  t.type === 'error'
                    ? 'var(--color-destructive)'
                    : t.type === 'success'
                    ? 'var(--color-accent-gold)'
                    : 'var(--color-border-medium)'
                }`,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-elevated)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <div
                style={{
                  color:
                    t.type === 'error'
                      ? 'var(--color-destructive)'
                      : t.type === 'success'
                      ? 'var(--color-accent-gold)'
                      : 'var(--color-text-secondary)',
                  marginTop: '1px',
                  flexShrink: 0,
                }}
              >
                {t.type === 'error' ? (
                  <AlertCircle size={18} />
                ) : t.type === 'success' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Info size={18} />
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  fontSize: '13px',
                  lineHeight: 1.4,
                  color: 'var(--color-text-primary)',
                }}
              >
                {t.message}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                style={{
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                  borderRadius: 'var(--radius-xs)',
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
