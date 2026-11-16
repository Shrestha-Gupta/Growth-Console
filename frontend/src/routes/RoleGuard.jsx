import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/feedback/FeedbackStates';

/**
 * RoleGuard
 * Strictly isolates administrative routes from ordinary users.
 * Enforces role verification on client-side routing based on AuthContext.
 */
export const RoleGuard = ({ allowedRoles = ['admin'], children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Verifying permissions..." height="100vh" />;
  }

  const isAuthorized = user && allowedRoles.includes(user.role);

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleGuard;
