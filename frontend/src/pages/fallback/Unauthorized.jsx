import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { PrimaryButton } from '../../components/common/Buttons';
import usePageEntrance from '../../hooks/usePageEntrance';

/**
 * Unauthorized (403)
 * Architectural security boundary notice.
 */
export const Unauthorized = () => {
  const navigate = useNavigate();
  const entranceRef = usePageEntrance();

  return (
    <div
      ref={entranceRef}
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div
        className="gsap-reveal"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(155, 61, 61, 0.08)',
          border: '1px solid var(--color-destructive)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-destructive)',
          marginBottom: '20px',
        }}
      >
        <ShieldX size={28} />
      </div>

      <span
        className="gsap-reveal"
        style={{
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-destructive)',
          display: 'block',
          marginBottom: '8px',
        }}
      >
        Status 403 / Access Denied
      </span>

      <h1
        className="gsap-reveal"
        style={{
          fontSize: '28px',
          fontWeight: '600',
          letterSpacing: '-0.02em',
          color: 'var(--color-text-primary)',
          margin: '0 0 12px 0',
        }}
      >
        Administrative Clearance Required
      </h1>

      <p
        className="gsap-reveal"
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          maxWidth: '460px',
          lineHeight: 1.5,
          margin: '0 0 24px 0',
        }}
      >
        The requested resource is restricted to verified administrators under Tier 1 system governance. Your active session lacks the required cryptographic claims.
      </p>

      <div className="gsap-reveal">
        <PrimaryButton onClick={() => navigate('/portal/overview')} icon={ArrowLeft}>
          Return to Member Portal
        </PrimaryButton>
      </div>
    </div>
  );
};

export default Unauthorized;
