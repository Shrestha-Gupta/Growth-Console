// frontend/src/pages/user/UserOverview.jsx
import React from 'react';
import { User, Shield, Bell, ArrowRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusPill from '../../components/common/StatusPill';
import { useAuth } from '../../context/AuthContext';
import usePageEntrance from '../../hooks/usePageEntrance';

/**
 * UserOverview
 * Personal user console welcome page and telemetry summary.
 * Connected to live authenticated user session from Phase 6 & 7.
 */
export const UserOverview = () => {
  const entranceRef = usePageEntrance();
  const { user, accountNotice } = useAuth();

  const currentUser = user || {
    name: 'Authenticated Member',
    email: 'Awaiting session authentication',
    role: 'user',
    status: 'active',
    createdAt: null,
    lastLogin: null,
  };

  return (
    <div ref={entranceRef} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Inactive Account Advisory Banner if Applicable */}
      {accountNotice && (
        <div
          className="gsap-reveal"
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(197, 160, 89, 0.12)',
            border: '1px solid var(--color-accent-gold)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <AlertTriangle size={20} color="var(--color-accent-gold)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Account Notice
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {accountNotice}
            </span>
          </div>
        </div>
      )}

      {/* Welcome Hero */}
      <div
        className="gsap-reveal"
        style={{
          padding: '36px 32px',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-gold)',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            Member Portal
          </span>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '0 0 8px 0',
            }}
          >
            Welcome, {currentUser.name}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              margin: 0,
              maxWidth: '520px',
              lineHeight: 1.5,
            }}
          >
            Your account is verified and operational under the Growth Tech India system governance tier.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StatusPill status={currentUser.role} type="role" />
          <StatusPill status={currentUser.status} />
        </div>
      </div>

      {/* Two-Column Telemetry & Notices */}
      <div
        className="gsap-reveal"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Account Telemetry */}
        <div
          style={{
            padding: '24px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <User size={18} color="var(--color-accent-gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>
              Account Verification Details
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Registered Email</span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{currentUser.email}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Enrollment Date</span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '—'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Last Session Activity</span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'Current Active Session'}
              </strong>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <Link
              to="/portal/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                borderBottom: '1px solid var(--color-accent-gold)',
                paddingBottom: '2px',
              }}
            >
              <span>Manage Profile & Security Settings</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Security & System Notices */}
        <div
          style={{
            padding: '24px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Bell size={18} color="var(--color-accent-gold)" />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>
              System Governance Advisory
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--color-bg-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
                Secure HTTP-Only JWT Protection
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Your authentication tokens are cryptographically secured in HTTP-only cookies, shielding your session from browser memory inspection.
              </p>
            </div>

            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--color-bg-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
                Role Boundary Enforcement
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Administrative modifications and user promotions are protected under Tier 1 governance and require verified administrative keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;
