// src/utils/jwt.js
// JWT token generation and verification with unique per-session jti claim.

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const COOKIE_NAME = 'gc_token';

/**
 * Create a signed JWT containing user id, role, and a unique session jti claim.
 * Returns { token, jti }.
 */
export const signToken = (userId, role, customJti = null) => {
  const jti = customJti || crypto.randomUUID();
  const token = jwt.sign({ id: userId, role, jti }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
  return { token, jti };
};

/**
 * Verify and decode a JWT. Returns the decoded payload (including id, role, jti) or throws.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

/**
 * Set the JWT as an HTTP-only cookie on the response.
 */
export const setTokenCookie = (res, token) => {
  const maxAge = parseExpiry(env.jwtExpiresIn);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    maxAge,
    path: '/',
  });
};

/**
 * Clear the auth cookie.
 */
export const clearTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    path: '/',
  });
};

/**
 * Extract the token from the cookie (primary) or Authorization header (fallback).
 */
export const extractToken = (req) => {
  // 1. HTTP-only cookie (primary strategy)
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }

  // 2. Authorization: Bearer <token> (dev/API client fallback)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
};

// ─── Helper: parse "8h" / "15m" / "7d" to milliseconds ──────────────────────
function parseExpiry(str) {
  const match = str.match(/^(\d+)(m|h|d)$/);
  if (!match) return 8 * 60 * 60 * 1000; // default 8h
  const val = parseInt(match[1], 10);
  switch (match[2]) {
    case 'm': return val * 60 * 1000;
    case 'h': return val * 60 * 60 * 1000;
    case 'd': return val * 24 * 60 * 60 * 1000;
    default: return 8 * 60 * 60 * 1000;
  }
}

export { COOKIE_NAME };
