import React, { Suspense, lazy } from 'react';
import { Outlet, Link } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';

// Lazy load Three.js visual to isolate WebGL bundle
const AuthVisual = lazy(() => import('../animation/AuthVisual'));

/**
 * AuthSplitLayout
 * 50/50 split-screen architecture for authentication workflows.
 * Left: Warm Charcoal visual canvas with Three.js polyhedron (desktop only).
 * Right: Warm Ivory form container.
 */
export const AuthSplitLayout = () => {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: 'var(--color-bg-base)',
        overflowX: 'hidden',
      }}
    >
      {/* Visual Canvas (Desktop & Laptop only, hidden on mobile & tablet) */}
      <div
        className="auth-visual-pane"
        style={{
          flex: '1 1 50%',
          backgroundColor: 'var(--color-bg-dark)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          color: 'var(--color-text-inverse)',
          borderRight: '1px solid var(--color-border-dark)',
          overflow: 'hidden',
        }}
      >
        {/* Brand Header */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <BrandLogo variant="dark" />
        </div>

        {/* Center 3D Space */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'auto',
          }}
        >
          <Suspense fallback={null}>
            <AuthVisual />
          </Suspense>
        </div>

        {/* Editorial Footnote */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-champagne)',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            System Governance
          </span>
          <p
            style={{
              fontSize: '14px',
              color: '#A8A29A',
              maxWidth: '360px',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Sovereign administrative architecture engineered for precision, high data density, and secure role governance.
          </p>
        </div>
      </div>

      {/* Form Canvas */}
      <div
        className="auth-form-pane"
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px 24px',
          backgroundColor: 'var(--color-bg-base)',
          position: 'relative',
        }}
      >
        {/* Mobile Brand Header */}
        <div className="mobile-brand-header" style={{ marginBottom: '32px' }}>
          <BrandLogo />
        </div>

        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        .mobile-brand-header {
          display: none;
        }

        @media (max-width: 1024px) {
          .auth-visual-pane {
            display: none !important;
          }
          .auth-form-pane {
            flex: 1 1 100% !important;
          }
          .mobile-brand-header {
            display: block;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthSplitLayout;
