import React from 'react';
import { AlertTriangle, FolderOpen, RefreshCw } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';

/**
 * LoadingState
 * Architectural loading indicator with antique gold spinner and optional status text.
 */
export const LoadingState = ({ message = 'Loading system data...', height = '240px' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        height,
        width: '100%',
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          border: '2px solid var(--color-border-medium)',
          borderTopColor: 'var(--color-accent-gold)',
          borderRadius: '50%',
          animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        }}
      />
      <span
        style={{
          fontSize: '13px',
          fontWeight: '500',
          letterSpacing: '0.02em',
          color: 'var(--color-text-muted)',
        }}
      >
        {message}
      </span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * EmptyState
 * Refined editorial empty state notice with custom icon and optional recovery action.
 */
export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No Records Available',
  description = 'There are no active records matching your current filter criteria.',
  actionText,
  onAction,
  height = '300px',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 16px',
        height,
        width: '100%',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-bg-sunken)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          marginBottom: '14px',
        }}
      >
        <Icon size={20} />
      </div>

      <h4
        style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          margin: '0 0 6px 0',
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          maxWidth: '360px',
          margin: '0 0 16px 0',
          lineHeight: 1.45,
        }}
      >
        {description}
      </p>

      {actionText && onAction && (
        <SecondaryButton onClick={onAction}>{actionText}</SecondaryButton>
      )}
    </div>
  );
};

/**
 * ErrorState
 * Muted crimson error banner with explicit retry capability.
 */
export const ErrorState = ({
  title = 'System Error Encountered',
  message = 'An unexpected failure occurred while communicating with the console API.',
  onRetry,
  height = '240px',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px 16px',
        height,
        width: '100%',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(155, 61, 61, 0.08)',
          border: '1px solid var(--color-destructive)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-destructive)',
          marginBottom: '12px',
        }}
      >
        <AlertTriangle size={20} />
      </div>

      <h4
        style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--color-destructive)',
          margin: '0 0 6px 0',
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          maxWidth: '380px',
          margin: '0 0 16px 0',
          lineHeight: 1.45,
        }}
      >
        {message}
      </p>

      {onRetry && (
        <PrimaryButton onClick={onRetry} icon={RefreshCw}>
          Retry Request
        </PrimaryButton>
      )}
    </div>
  );
};

export default { LoadingState, EmptyState, ErrorState };
