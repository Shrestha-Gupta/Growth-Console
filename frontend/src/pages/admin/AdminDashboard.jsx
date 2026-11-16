// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, ShieldAlert, ArrowUpRight, ShieldCheck, RefreshCw } from 'lucide-react';
import StatusPill from '../../components/common/StatusPill';
import { EmptyState, LoadingState, ErrorState } from '../../components/feedback/FeedbackStates';
import usePageEntrance from '../../hooks/usePageEntrance';
import api from '../../services/api';

/**
 * AdminDashboard
 * Executive administrative dashboard featuring:
 * - Unified 5-column executive metrics bar with live MongoDB aggregation
 * - Dynamic 30-day registration trajectory graphic
 * - Recent account enrollments panel
 * - Real-time telemetry overview
 */
export const AdminDashboard = () => {
  const entranceRef = usePageEntrance();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/metrics/dashboard');
      setData(res?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to stream executive metrics from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const metrics = useMemo(() => {
    const counts = data?.metrics || {};
    return [
      {
        label: 'Total Users',
        value: counts.totalUsers !== undefined ? counts.totalUsers.toLocaleString() : '—',
        subtext: counts.totalUsers !== undefined ? `${counts.totalUsers} registered in database` : 'Awaiting data',
        icon: Users,
      },
      {
        label: 'Active Users',
        value: counts.activeUsers !== undefined ? counts.activeUsers.toLocaleString() : '—',
        subtext: counts.activeUsers !== undefined ? 'Normal operational access' : 'Awaiting data',
        icon: UserCheck,
      },
      {
        label: 'Inactive Users',
        value: counts.inactiveUsers !== undefined ? counts.inactiveUsers.toLocaleString() : '—',
        subtext: counts.inactiveUsers !== undefined ? 'Restricted application access' : 'Awaiting data',
        icon: UserX,
      },
      {
        label: 'Suspended Users',
        value: counts.suspendedUsers !== undefined ? counts.suspendedUsers.toLocaleString() : '—',
        subtext: counts.suspendedUsers !== undefined ? 'Authentication blocked' : 'Awaiting data',
        icon: ShieldAlert,
      },
      {
        label: 'Administrators',
        value: counts.adminUsers !== undefined ? counts.adminUsers.toLocaleString() : '—',
        subtext: counts.adminUsers !== undefined ? 'Tier 1 privileged governance' : 'Awaiting data',
        icon: ShieldCheck,
      },
    ];
  }, [data]);

  const recentRegistrations = data?.recentRegistrations || [];
  const trend = data?.trend || [];

  // Calculate SVG curve coordinates for 30-day registration trajectory
  const chartCoordinates = useMemo(() => {
    if (!trend.length) return { pathD: '', hasActivity: false };

    const maxCount = Math.max(...trend.map((t) => t.count), 1);
    const hasActivity = trend.some((t) => t.count > 0);
    const points = trend.map((t, idx) => {
      const x = (idx / (trend.length - 1)) * 500;
      // y ranges from 140 (0 count) to 30 (maxCount)
      const y = 140 - (t.count / maxCount) * 100;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    return { pathD, hasActivity };
  }, [trend]);

  return (
    <div ref={entranceRef} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Section */}
      <div className="gsap-reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
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
            Executive Overview
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
            System Administration Console
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchMetrics}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            title="Refresh metrics telemetry"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/users"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-medium)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)')}
          >
            <span>Open Full User Registry</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchMetrics} />
      ) : (
        <>
          {/* Executive Metrics Bar (Connected Architectural Grid) */}
          <div
            className="gsap-reveal metrics-bar-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="metric-card-cell"
                  style={{
                    padding: '24px 20px',
                    borderRight: idx < metrics.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '128px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {m.label}
                    </span>
                    <Icon size={16} color="var(--color-accent-gold)" />
                  </div>

                  <div style={{ margin: '14px 0 4px 0' }}>
                    <span
                      style={{
                        fontSize: '32px',
                        fontWeight: '600',
                        letterSpacing: '-0.03em',
                        color: 'var(--color-text-primary)',
                        lineHeight: 1,
                      }}
                    >
                      {isLoading ? '...' : m.value}
                    </span>
                  </div>

                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {isLoading ? 'Streaming metrics...' : m.subtext}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Two-Column Middle Section: Trajectory & Recent Registrations */}
          <div
            className="gsap-reveal"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1.2fr',
              gap: '24px',
            }}
            id="dashboard-split"
          >
            {/* Registration Velocity Graphic */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: 'var(--color-text-primary)',
                        margin: 0,
                      }}
                    >
                      Registration Trajectory (30-Day Window)
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      User onboarding velocity across consecutive calendar cycles
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: chartCoordinates.hasActivity ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                      backgroundColor: 'var(--color-bg-sunken)',
                      border: '1px solid var(--color-border)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {isLoading ? 'Streaming' : chartCoordinates.hasActivity ? 'Live Telemetry' : 'Baseline Active'}
                  </span>
                </div>

                {/* SVG Minimalist Chart Frame with Real Telemetry Curve */}
                <div style={{ width: '100%', height: '180px', marginTop: '16px', position: 'relative' }}>
                  <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    {/* Structural Grid Lines */}
                    <line x1="0" y1="40" x2="500" y2="40" stroke="var(--color-border)" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke="var(--color-border)" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="500" y2="140" stroke="var(--color-border)" strokeDasharray="3 3" />

                    {/* Neutral Baseline */}
                    <line x1="0" y1="140" x2="500" y2="140" stroke="var(--color-border-medium)" strokeWidth="1.5" />

                    {/* Render Real Trajectory Path when Available */}
                    {chartCoordinates.hasActivity && (
                      <path
                        d={chartCoordinates.pathD}
                        fill="none"
                        stroke="var(--color-accent-gold)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>

                  {!chartCoordinates.hasActivity && !isLoading && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-muted)',
                          backgroundColor: 'var(--color-bg-surface)',
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        Stable baseline — onboarding events will render upon new member registrations
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '12px',
                  marginTop: '16px',
                }}
              >
                <span>Day -30</span>
                <span>Day -20</span>
                <span>Day -10</span>
                <span>Day -5</span>
                <span>Today</span>
              </div>
            </div>

            {/* Recent Enrollments Panel */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}
                >
                  Recent Enrollments
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Real-time Database
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', flex: 1 }}>
                {recentRegistrations.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No Enrollments Recorded"
                    description="No member onboarding records found in the database."
                    height="190px"
                  />
                ) : (
                  recentRegistrations.map((u) => (
                    <div
                      key={u._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        backgroundColor: 'var(--color-bg-sunken)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: 'var(--color-text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {u.name}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {u.email} • {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <StatusPill status={u.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 860px) {
          .metrics-bar-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .metric-card-cell {
            border-bottom: 1px solid var(--color-border);
          }
        }
        @media (max-width: 500px) {
          .metrics-bar-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 900px) {
          #dashboard-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
