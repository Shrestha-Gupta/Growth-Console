// src/validators/profileValidator.js
// Input validation rules for profile self-service endpoints.

import { body } from 'express-validator';
import { validate } from './authValidator.js';

export const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  // Block any attempt to change email, role, or status via profile
  body('email').customSanitizer(() => undefined),
  body('role').customSanitizer(() => undefined),
  body('status').customSanitizer(() => undefined),
  validate,
];

export const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  validate,
];
