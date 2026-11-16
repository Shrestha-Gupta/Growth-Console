// src/middleware/authenticate.js
// Verifies JWT from cookie/header and attaches req.user.

import User                from '../models/User.js';
import { verifyToken, extractToken } from '../utils/jwt.js';
import { ApiResponse }     from '../utils/ApiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return ApiResponse.unauthorized(res, 'Authentication required — no token provided');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      const msg = err.name === 'TokenExpiredError'
        ? 'Session expired — please sign in again'
        : 'Invalid authentication token';
      return ApiResponse.unauthorized(res, msg);
    }

    // Fetch user (without password)
    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.unauthorized(res, 'Account no longer exists');
    }

    // Block suspended users from all access
    if (user.status === 'suspended') {
      return ApiResponse.forbidden(res, 'Account suspended — authentication and application access denied');
    }

    // Attach user and session jti to request for downstream middleware and handlers
    // Note: inactive users pass authentication so they can inspect session/notice via /me
    req.user = user;
    req.jti = decoded.jti || null;
    next();
  } catch (err) {
    next(err);
  }
};
