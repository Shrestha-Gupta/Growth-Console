// src/controllers/profileController.js
// Self-service profile management — authenticated users only.

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse }  from '../utils/ApiResponse.js';
import User             from '../models/User.js';
import { AppError }     from '../middleware/errorHandler.js';

/**
 * GET /api/v1/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  ApiResponse.ok(res, 'Profile retrieved', {
    user: req.user.toJSON(),
  });
});

/**
 * PATCH /api/v1/profile
 * Users may update only their own name.
 * Email, role, status are stripped by profileValidator.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (name !== undefined) {
    req.user.name = name;
  }

  await req.user.save({ validateModifiedOnly: true });

  ApiResponse.ok(res, 'Profile updated', {
    user: req.user.toJSON(),
  });
});

/**
 * PATCH /api/v1/profile/password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Fetch the user with password included
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new AppError('Account not found', 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword; // pre-save hook hashes it
  await user.save({ validateModifiedOnly: true });

  ApiResponse.ok(res, 'Password updated successfully');
});
