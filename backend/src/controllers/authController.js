// src/controllers/authController.js
// Authentication endpoint handlers.

import { asyncHandler }    from '../utils/asyncHandler.js';
import { ApiResponse }     from '../utils/ApiResponse.js';
import { signToken, setTokenCookie, clearTokenCookie } from '../utils/jwt.js';
import { registerUser, loginUser } from '../services/authService.js';
import {
  generateCsrfToken,
  setCsrfCookie,
  clearCsrfCookie,
  getSessionIdFromReq,
  verifyCsrfTokenString,
} from '../middleware/csrfProtection.js';

/**
 * GET /api/v1/auth/csrf-token
 * Public — returns CSRF token and sets gc_csrf_token cookie.
 * Issues a token bound to the current session (user or anon).
 */
export const getCsrfToken = asyncHandler(async (req, res) => {
  const sessionId = getSessionIdFromReq(req);
  let token = req.cookies?.gc_csrf_token;

  if (!token || !verifyCsrfTokenString(token, sessionId)) {
    token = generateCsrfToken(sessionId);
    setCsrfCookie(res, token);
  }

  ApiResponse.ok(res, 'CSRF token retrieved', { csrfToken: token });
});

/**
 * POST /api/v1/auth/register
 * Public — always creates role=user, status=active.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await registerUser({ name, email, password });

  // Issue JWT cookie with unique session jti immediately after registration
  const { token, jti } = signToken(user._id, user.role);
  setTokenCookie(res, token);

  // Rotate to fresh CSRF cookie bound to the unique session jti
  const csrfToken = generateCsrfToken(`sess_${jti}`);
  setCsrfCookie(res, csrfToken);

  ApiResponse.created(res, 'Account created successfully', {
    user: user.toJSON(),
    csrfToken,
  });
});

/**
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, jti } = await loginUser(res, { email, password });

  // Rotate to fresh CSRF cookie bound to the unique session jti
  const csrfToken = generateCsrfToken(`sess_${jti}`);
  setCsrfCookie(res, csrfToken);

  const isInactive = user.status === 'inactive';
  const message = isInactive
    ? 'Signed in with restricted access — account inactive'
    : 'Signed in successfully';

  const accountNotice = isInactive
    ? 'Your account is currently inactive. Application access remains restricted until activated by an administrator.'
    : null;

  ApiResponse.ok(res, message, {
    user: user.toJSON(),
    accountNotice,
    csrfToken,
  });
});

/**
 * GET /api/v1/auth/me
 * Authenticated — returns current user profile with account status notice.
 */
export const getMe = asyncHandler(async (req, res) => {
  const isInactive = req.user.status === 'inactive';
  const accountNotice = isInactive
    ? 'Your account is currently inactive. Application access remains restricted until activated by an administrator.'
    : null;

  ApiResponse.ok(res, 'Authenticated user retrieved', {
    user: req.user.toJSON(),
    accountNotice,
  });
});

/**
 * POST /api/v1/auth/logout
 * Clears both auth cookie and CSRF cookie.
 */
export const logout = asyncHandler(async (_req, res) => {
  clearTokenCookie(res);
  clearCsrfCookie(res);
  ApiResponse.ok(res, 'Signed out successfully');
});
