// src/middleware/csrfProtection.js
// CSRF protection: Origin verification and Signed Double-Submit CSRF Token validation
// with cryptographic HMAC session binding.

import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { extractToken, verifyToken } from '../utils/jwt.js';

const CSRF_COOKIE_NAME = 'gc_csrf_token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_HMAC_SECRET = env.cookieSecret || env.jwtSecret || 'growth_console_csrf_hmac_secret';

/**
 * Cryptographically timing-safe string comparison.
 */
export const safeCompare = (a, b) => {
  if (!a || !b || typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Determine the current session identifier for token binding.
 * Returns `sess_<jti>` for authenticated requests with a JWT session jti,
 * or `anon` for unauthenticated requests.
 */
export const getSessionIdFromReq = (req) => {
  if (req.jti) {
    return `sess_${req.jti}`;
  }
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded?.jti) {
        return `sess_${decoded.jti}`;
      }
      if (decoded?.id) {
        return `user_${decoded.id}`;
      }
    } catch {
      // Invalid or expired token — treat as anonymous
    }
  }
  return 'anon';
};

/**
 * Generate a cryptographically signed CSRF token bound to a session identifier.
 * Format: `<randomHex>.<sessionId>.<hmacSignature>`
 */
export const generateCsrfToken = (sessionId = 'anon') => {
  const randomHex = crypto.randomBytes(32).toString('hex');
  const payload = `${randomHex}.${sessionId}`;
  const signature = crypto
    .createHmac('sha256', CSRF_HMAC_SECRET)
    .update(payload)
    .digest('hex');

  return `${payload}.${signature}`;
};

/**
 * Verify cryptographic HMAC signature on a CSRF token.
 */
export const verifyCsrfSignature = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [randomHex, sessionId, signature] = parts;
  if (!randomHex || !sessionId || !signature) return false;

  const expectedHmac = crypto
    .createHmac('sha256', CSRF_HMAC_SECRET)
    .update(`${randomHex}.${sessionId}`)
    .digest('hex');

  return safeCompare(signature, expectedHmac);
};

/**
 * Verify both signature and session binding for a CSRF token string.
 */
export const verifyCsrfTokenString = (token, expectedSessionId = 'anon') => {
  if (!verifyCsrfSignature(token)) return false;
  const tokenSessionId = token.split('.')[1];
  return tokenSessionId === expectedSessionId;
};

/**
 * Set the signed CSRF token cookie on the response.
 * Non-httpOnly so client-side SPA JavaScript can read it and send in X-CSRF-Token header.
 */
export const setCsrfCookie = (res, token) => {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure:   env.isProd,
    sameSite: 'Lax',
    maxAge:   8 * 60 * 60 * 1000, // 8 hours (matches session)
    path:     '/',
  });
};

/**
 * Clear the CSRF token cookie.
 */
export const clearCsrfCookie = (res) => {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure:   env.isProd,
    sameSite: 'Lax',
    path:     '/',
  });
};

/**
 * CSRF Protection Middleware:
 * 1. Automatically seeds gc_csrf_token cookie on safe (GET/HEAD) requests if absent or invalid.
 * 2. On state-changing requests (POST, PUT, PATCH, DELETE):
 *    a. Rejects missing or untrusted Origin / Referer headers.
 *    b. Rejects missing X-CSRF-Token header or gc_csrf_token cookie.
 *    c. Rejects mismatched header vs cookie tokens (Double-Submit verification).
 *    d. Rejects invalid or tampered HMAC signatures.
 *    e. Rejects tokens not cryptographically bound to the current session (user or anon).
 */
export const csrfProtection = (req, res, next) => {
  // Safe HTTP methods do not mutate state
  if (SAFE_METHODS.has(req.method)) {
    const sessionId = getSessionIdFromReq(req);
    const existingCookie = req.cookies?.[CSRF_COOKIE_NAME];
    if (!existingCookie || !verifyCsrfTokenString(existingCookie, sessionId)) {
      const token = generateCsrfToken(sessionId);
      setCsrfCookie(res, token);
    }
    return next();
  }

  // ─── 1. Validate Origin / Referer ───────────────────────────────────────────
  let requestOrigin = req.headers.origin;

  if (!requestOrigin && req.headers.referer) {
    try {
      requestOrigin = new URL(req.headers.referer).origin;
    } catch {
      return ApiResponse.forbidden(res, 'CSRF verification failed — malformed referer');
    }
  }

  // Reject state-changing requests missing origin information
  if (!requestOrigin) {
    return ApiResponse.forbidden(res, 'CSRF verification failed — missing request origin');
  }

  // Reject origins outside the allowed whitelist
  if (!env.allowedOrigins.includes(requestOrigin)) {
    return ApiResponse.forbidden(res, 'CSRF verification failed — untrusted request origin');
  }

  // ─── 2. Validate Presence of Header and Cookie ──────────────────────────────
  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  if (!headerToken || !cookieToken) {
    return ApiResponse.forbidden(res, 'CSRF verification failed — missing CSRF token');
  }

  // ─── 3. Double-Submit Verification (Timing-Safe) ────────────────────────────
  if (!safeCompare(headerToken, cookieToken)) {
    return ApiResponse.forbidden(res, 'CSRF verification failed — mismatched CSRF token');
  }

  // ─── 4. Cryptographic HMAC Signature Verification ───────────────────────────
  if (!verifyCsrfSignature(headerToken)) {
    return ApiResponse.forbidden(res, 'CSRF verification failed — invalid or tampered CSRF signature');
  }

  // ─── 5. Cryptographic Session Binding Verification ──────────────────────────
  const currentSessionId = getSessionIdFromReq(req);
  const tokenSessionId = headerToken.split('.')[1];

  if (tokenSessionId !== currentSessionId) {
    return ApiResponse.forbidden(res, 'CSRF verification failed — token not bound to current session');
  }

  next();
};

export { CSRF_COOKIE_NAME };
