// src/middleware/authorize.js
// Role-based access control and account-status gating.

import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Restrict access to specific roles.
 * Usage: authorize('admin')  or  authorize('admin', 'user')
 */
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Authentication required');
  }
  if (!allowedRoles.includes(req.user.role)) {
    return ApiResponse.forbidden(res, 'Insufficient privileges for this resource');
  }
  next();
};

/**
 * Require the user's account to be active.
 * - Inactive users receive a 403 with an account-status notice.
 * - Suspended users receive a 403 with an access denied notice.
 */
export const requireActive = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Authentication required');
  }
  if (req.user.status === 'suspended') {
    return ApiResponse.forbidden(res, 'Account suspended — application access denied');
  }
  if (req.user.status === 'inactive') {
    return ApiResponse.forbidden(
      res,
      'Account inactive — application access is restricted. Please contact an administrator.',
      {
        accountStatus: 'inactive',
        notice: 'Your account is inactive. Application access remains restricted until activated by an administrator.',
      }
    );
  }
  next();
};
