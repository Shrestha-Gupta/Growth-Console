import React, { useState, useEffect } from 'react';
import { User, Lock, Save, KeyRound } from 'lucide-react';
import { TextInput, PasswordInput } from '../../components/common/Inputs';
import { PrimaryButton } from '../../components/common/Buttons';
import StatusPill from '../../components/common/StatusPill';
import { useToast } from '../../components/feedback/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import usePageEntrance from '../../hooks/usePageEntrance';

/**
 * UserProfile
 * Self-service personal profile management and credential rotation.
 * Enforces role and status immutability for non-admin accounts.
 */
export const UserProfile = () => {
  const toast = useToast();
  const entranceRef = usePageEntrance();
  const { user, refreshUser, setUser } = useAuth();

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Sync profile name with authenticated user
  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    }
  }, [user?.name]);

  // Password Rotation Form State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isRotatingPassword, setIsRotatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const trimmed = profileName.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty.');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 80) {
      toast.error('Name must be between 2 and 80 characters.');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const res = await api.patch('/profile', { name: trimmed });
      if (res?.data?.user) {
        setUser(res.data.user);
      } else {
        await refreshUser();
      }
      toast.success('Profile display name updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile name.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwords.newPassword || passwords.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters';
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    try {
      setIsRotatingPassword(true);
      setPasswordErrors({});
      await api.patch('/profile/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      toast.success('Password successfully updated.');
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          if (e.path || e.field) {
            fieldErrors[e.path || e.field] = e.msg || e.message;
          }
        });
        setPasswordErrors(fieldErrors);
      }
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setIsRotatingPassword(false);
    }
  };

  return (
    <div ref={entranceRef} style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '840px' }}>
      {/* Title */}
      <div className="gsap-reveal">
        <span
          style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-accent-gold)',
            display: 'block',
            marginBottom: '4px',
          }}
        >
          Account Preferences
        </span>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Profile & Security Settings
        </h1>
      </div>

      {/* Module 1: Personal Profile Information */}
      <div
        className="gsap-reveal"
        style={{
          padding: '28px',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <User size={18} color="var(--color-accent-gold)" />
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>
            Personal Identification
          </h2>
        </div>

        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <TextInput
            label="Full Name"
            placeholder="Enter member full name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            required
          />

          <TextInput
            label="Email Address (System Fixed)"
            value={user?.email || '—'}
            disabled
            helperText="Account emails are permanently linked and cannot be modified self-service."
          />

          {/* Immutability Safeguards Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: 'var(--color-bg-sunken)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                System Privilege & Status
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Role assignment and status are governed exclusively by administrators.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusPill status={user?.role || 'user'} type="role" />
              <StatusPill status={user?.status || 'active'} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <PrimaryButton type="submit" isLoading={isUpdatingProfile} icon={Save}>
              Save Profile Changes
            </PrimaryButton>
          </div>
        </form>
      </div>

      {/* Module 2: Password Rotation */}
      <div
        className="gsap-reveal"
        style={{
          padding: '28px',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <KeyRound size={18} color="var(--color-accent-gold)" />
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>
            Credential Rotation
          </h2>
        </div>

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <PasswordInput
            label="Current Password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            error={passwordErrors.currentPassword}
            required
          />

          <PasswordInput
            label="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            error={passwordErrors.newPassword}
            required
          />

          <PasswordInput
            label="Confirm New Password"
            value={passwords.confirmNewPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
            error={passwordErrors.confirmNewPassword}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <PrimaryButton type="submit" isLoading={isRotatingPassword} icon={Lock}>
              Rotate Password
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
