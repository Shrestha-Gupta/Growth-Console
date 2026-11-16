import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthSplitLayout from '../components/layout/AuthSplitLayout';
import AdminLayout from '../components/layout/AdminLayout';
import UserLayout from '../components/layout/UserLayout';

// Feedback Loading State
import { LoadingState } from '../components/feedback/FeedbackStates';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

// Lazy Loaded Pages (Architectural Code-Splitting)
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const UserDetails = lazy(() => import('../pages/admin/UserDetails'));
const UserOverview = lazy(() => import('../pages/user/UserOverview'));
const UserProfile = lazy(() => import('../pages/user/UserProfile'));
const Unauthorized = lazy(() => import('../pages/fallback/Unauthorized'));
const NotFound = lazy(() => import('../pages/fallback/NotFound'));

/**
 * AppRoutes
 * Master route configuration mapping all layouts, guards, and views
 * with suspense-wrapped lazy loading.
 */
export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingState message="Initializing Console Environment..." height="100vh" />}>
      <Routes>
        {/* Root Redirection */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Public Authentication Routes (Split Layout) */}
        <Route element={<AuthSplitLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected User Portal Routes */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/portal/overview" replace />} />
          <Route path="overview" element={<UserOverview />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Protected Admin Console Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin']}>
                <AdminLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetails />} />
        </Route>

        {/* Exception Screens */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
