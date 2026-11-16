// src/services/authService.js
// Authentication business logic — separated from HTTP concerns.

import User                          from '../models/User.js';
import { signToken, setTokenCookie } from '../utils/jwt.js';
import { AppError }                  from '../middleware/errorHandler.js';

/**
 * Register a new user (always role=user, status=active).
 */
export const registerUser = async ({ name, email, password }) => {
  // Check for existing email
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role:   'user',
    status: 'active',
  });

  return user;
};

/**
 * Authenticate and issue JWT cookie.
 * Returns { user, token }.
 */
export const loginUser = async (res, { email, password }) => {
  // Fetch user WITH password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status === 'suspended') {
    throw new AppError('Account suspended — contact an administrator', 403);
  }

  // Generate token with unique jti and set cookie
  const { token, jti } = signToken(user._id, user.role);
  setTokenCookie(res, token);

  // Update lastLogin
  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });

  return { user, token, jti };
};
