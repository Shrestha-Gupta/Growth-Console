// frontend/src/pages/admin/UserDetails.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, Activity, Calendar, Clock, Trash2 } from 'lucide-react';
import StatusPill from '../../components/common/StatusPill';
import { DestructiveButton } from '../../components/common/Buttons';
import { EmptyState, LoadingState, ErrorState } from '../../components/feedback/FeedbackStates';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/feedback/ToastContext';
import usePageEntrance from '../../hooks/usePageEntrance';
import api from '../../services/api';

/**
 * UserDetails
 * Deep-dive record inspector for single user profiles.
 * Displays live document telemetry from MongoDB via Phase 7 REST API.
 */
export const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const entranceRef = usePageEntrance();

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/users/${id}`);
      setUserData(res?.data?.user || null);
    } catch (err) {
      setError(err.message || 'Failed to retrieve user record.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('Record purged successfully.');
      setIsDeleteDialogOpen(false);
      navigate('/admin/users');
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  return (
    <div ref={entranceRef} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Back Navigation Bar */}
      <div className="gsap-reveal" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <ArrowLeft size={15} />
          <span>Return to User Registry</span>
        </button>
      </div>

      {isLoading ? (
        <LoadingState message="Retrieving user record telemetry..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUser} />
      ) : !userData ? (
        <div
          className="gsap-reveal"
          style={{
            padding: '48px 32px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <EmptyState
            icon={User}
            title="User Record Not Found"
            description={`No document matched identifier ${id || 'unspecified'}.`}
            actionText="Return to Registry"
            onAction={() => navigate('/admin/users')}
          />
        </div>
      ) : (
        /* Rendered Data View */
        <>
          <div
            className="gsap-reveal"
            style={{
              padding: '32px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-accent-gold-soft)',
                  border: '1px solid var(--color-accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-gold)',
                  fontSize: '22px',
                  fontWeight: '600',
                }}
              >
                {(userData.name || 'U').substring(0, 2).toUpperCase()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1
                    style={{
                      fontSize: '24px',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    {userData.name}
                  </h1>
                  <StatusPill status={userData.role} type="role" />
                  <StatusPill status={userData.status} />
                </div>

                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {userData.email} • System ID: {userData._id}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DestructiveButton onClick={() => setIsDeleteDialogOpen(true)} icon={Trash2}>
                Purge Account
              </DestructiveButton>
            </div>
          </div>

          {/* Telemetry Detail Grid */}
          <div
            className="gsap-reveal"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="var(--color-accent-gold)" />
                <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Enrollment Date
                </span>
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}>
                {new Date(userData.createdAt).toLocaleString()}
              </strong>
            </div>

            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--color-accent-gold)" />
                <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Last Session Activity
                </span>
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}>
                {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'No prior session recorded'}
              </strong>
            </div>

            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="var(--color-accent-gold)" />
                <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Record Last Modified
                </span>
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}>
                {userData.updatedAt ? new Date(userData.updatedAt).toLocaleString() : '—'}
              </strong>
            </div>
          </div>

          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDelete}
            title="Permanent User Purge"
            description={`This will permanently remove ${userData.name}'s account and credentials from MongoDB.`}
            confirmEmail={userData.email}
            isLastAdminWarning={userData.role === 'admin'}
          />
        </>
      )}
    </div>
  );
};

export default UserDetails;
