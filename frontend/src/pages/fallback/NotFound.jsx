import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { PrimaryButton } from '../../components/common/Buttons';
import usePageEntrance from '../../hooks/usePageEntrance';

/**
 * NotFound (404)
 * Architectural route exception screen.
 */
export const NotFound = () => {
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
          backgroundColor: 'var(--color-bg-sunken)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-accent-gold)',
          marginBottom: '20px',
        }}
      >
        <Compass size={28} />
      </div>

      <span
        className="gsap-reveal"
        style={{
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          display: 'block',
          marginBottom: '8px',
        }}
      >
        Status 404 / Route Undefined
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
        Resource Location Not Found
      </h1>

      <p
        className="gsap-reveal"
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          maxWidth: '440px',
          lineHeight: 1.5,
          margin: '0 0 24px 0',
        }}
      >
        The requested system path does not correspond to an active module or data collection within Growth Console.
      </p>

      <div className="gsap-reveal">
        <PrimaryButton onClick={() => navigate('/admin/dashboard')} icon={ArrowLeft}>
          Return to Console
        </PrimaryButton>
      </div>
    </div>
  );
};

export default NotFound;
