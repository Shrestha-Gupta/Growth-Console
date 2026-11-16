import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCircle, LogOut } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import StatusPill from '../common/StatusPill';
import { useAuth } from '../../context/AuthContext';

/**
 * UserLayout
 * Dedicated user portal shell partitioned strictly from administrative tools.
 * Focuses on personal telemetry, profile management, and account security.
 */
export const UserLayout = () => {
  const navigate = useNavigate();

  const userNavItems = [
    { label: 'Overview', path: '/portal/overview', icon: LayoutDashboard },
    { label: 'Profile Settings', path: '/portal/profile', icon: UserCircle },
  ];

  const { user: authUser, logout, accountNotice } = useAuth();
  const user = authUser || {
    name: 'Member',
    email: 'user@growthconsole.internal',
    role: 'user',
    status: 'active',
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      {/* Top Navigation Bar */}
      <header
        style={{
          height: '68px',
          backgroundColor: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <BrandLogo />

          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {userNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    backgroundColor: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                    borderBottom: isActive
                      ? '2px solid var(--color-accent-gold)'
                      : '2px solid transparent',
                    transition: 'all var(--transition-fast)',
                  })}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusPill status="user" type="role" />
            <StatusPill status={user.status} />
          </div>

          <div
            style={{
              height: '24px',
              width: '1px',
              backgroundColor: 'var(--color-border)',
            }}
          />

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-medium)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-destructive)';
              e.currentTarget.style.borderColor = 'var(--color-destructive)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border-medium)';
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main style={{ flex: 1, padding: '36px 24px', overflowY: 'auto' }}>
        <div className="container-editorial">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
