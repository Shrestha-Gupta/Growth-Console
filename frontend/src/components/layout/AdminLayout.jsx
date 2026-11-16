import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ChevronRight,
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import StatusPill from '../common/StatusPill';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminLayout
 * Executive layout for administrative operations:
 * - Persistent left navigation sidebar
 * - Architectural top bar with telemetry and session controls
 * - Responsive off-canvas drawer on mobile devices
 */
export const AdminLayout = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation Items
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Registry', path: '/admin/users', icon: Users },
  ];

  const { user, logout, accountNotice } = useAuth();
  const activeUser = user || {
    name: 'Administrator',
    email: 'admin@growthconsole.internal',
    role: 'admin',
    status: 'active',
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentNavItem = navItems.find((item) => location.pathname.startsWith(item.path));

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 27, 26, 0.45)',
            zIndex: 900,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`admin-sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}
        style={{
          width: '260px',
          backgroundColor: 'var(--color-bg-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 950,
          transition: 'transform var(--transition-normal)',
        }}
      >
        {/* Sidebar Header */}
        <div>
          <div
            style={{
              padding: '24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <BrandLogo />
            <button
              type="button"
              className="mobile-close-btn"
              onClick={() => setIsMobileNavOpen(false)}
              aria-label="Close navigation"
              style={{
                display: 'none',
                color: 'var(--color-text-muted)',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <div style={{ padding: '20px 12px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                padding: '0 12px',
                display: 'block',
                marginBottom: '10px',
              }}
            >
              Console Modules
            </span>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileNavOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: isActive ? '600' : '500',
                      letterSpacing: '0.01em',
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      backgroundColor: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                      borderLeft: isActive
                        ? '3px solid var(--color-accent-gold)'
                        : '3px solid transparent',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Icon
                      size={17}
                      color={isActive ? 'var(--color-accent-gold)' : 'var(--color-text-muted)'}
                    />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer: Active Admin Profile */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-sunken)',
                  border: '1px solid var(--color-border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-primary)',
                  fontWeight: '600',
                  fontSize: '12px',
                }}
              >
                {((activeUser?.name || 'AD').split(' ').map((p) => p[0]).join('')).slice(0, 2).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.2,
                  }}
                >
                  {activeUser.name}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.2,
                  }}
                >
                  {activeUser.email}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-sunken)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-destructive)';
              e.currentTarget.style.borderColor = 'var(--color-destructive)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            <LogOut size={14} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Top Navigation Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 800,
          }}
        >
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation menu"
              style={{
                display: 'none',
                color: 'var(--color-text-primary)',
              }}
            >
              <Menu size={20} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
              }}
            >
              <span>Console</span>
              <ChevronRight size={14} />
              <strong style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                {currentNavItem ? currentNavItem.label : 'Overview'}
              </strong>
            </div>
          </div>

          {/* Right: Telemetry & Status Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StatusPill status="admin" type="role" />
            <StatusPill status="active" />
          </div>
        </header>

        {/* Main Content Canvas */}
        <main
          style={{
            flex: 1,
            padding: '32px 24px',
            overflowY: 'auto',
          }}
        >
          <div className="container-editorial">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .admin-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .admin-sidebar.mobile-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
