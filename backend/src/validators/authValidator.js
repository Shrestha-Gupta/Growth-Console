// src/validators/authValidator.js
// Input validation rules for authentication endpoints.

import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/ApiResponse.js';

// Shared middleware: run after validation chain, return errors if any
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return ApiResponse.badRequest(res, messages[0], messages);
  }
  next();
};

export const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  // Silently strip any attempt to set role or status
  body('role').customSanitizer(() => 'user'),
  body('status').customSanitizer(() => 'active'),
  validate,
];

export const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate,
];
