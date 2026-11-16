import React, { useState } from 'react';
import { Modal } from './Modal';
import { SecondaryButton, DestructiveButton } from './Buttons';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog
 * High-stakes destructive confirmation modal with safeguard checks
 * and optional confirmation typing verification.
 */
export const ConfirmDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Destructive Action',
  description = 'Are you certain you wish to proceed? This operation cannot be reversed.',
  confirmText = 'Delete Record',
  confirmEmail = '',
  isLoading = false,
  isLastAdminWarning = false,
}) => {
  const [typedVerification, setTypedVerification] = useState('');

  const isVerificationRequired = Boolean(confirmEmail);
  const isMatch = !isVerificationRequired || typedVerification.trim() === confirmEmail.trim();

  const handleConfirm = () => {
    if (isMatch && !isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setTypedVerification('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidth="480px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(155, 61, 61, 0.08)',
              border: '1px solid var(--color-destructive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--color-destructive)',
            }}
          >
            <AlertTriangle size={18} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {description}
            </p>

            {isLastAdminWarning && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-bg-sunken)',
                  border: '1px solid var(--color-accent-gold)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.4,
                }}
              >
                <strong style={{ color: 'var(--color-text-gold)' }}>[!] System Guardrail:</strong> If this target is the last remaining active administrator, the operation will be rejected automatically.
              </div>
            )}
          </div>
        </div>

        {isVerificationRequired && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-text-secondary)',
              }}
            >
              Type <strong>{confirmEmail}</strong> to confirm:
            </label>
            <input
              type="text"
              value={typedVerification}
              onChange={(e) => setTypedVerification(e.target.value)}
              placeholder={confirmEmail}
              style={{
                width: '100%',
                height: '40px',
                backgroundColor: 'var(--color-bg-sunken)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 12px',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '8px',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '16px',
          }}
        >
          <SecondaryButton onClick={handleClose} disabled={isLoading}>
            Cancel
          </SecondaryButton>
          <DestructiveButton
            onClick={handleConfirm}
            disabled={!isMatch || isLoading}
            isLoading={isLoading}
          >
            {confirmText}
          </DestructiveButton>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
