// src/validators/userValidator.js
// Input validation rules for admin user-management endpoints.

import { body, query, param } from 'express-validator';
import { validate } from './authValidator.js';

export const listUsersRules = [
  // Reject arbitrary MongoDB query operators
  query().custom((value, { req }) => {
    const hasMongoOperator = (obj) => {
      if (!obj || typeof obj !== 'object') return false;
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$')) return true;
        if (typeof obj[key] === 'object' && hasMongoOperator(obj[key])) return true;
      }
      return false;
    };
    if (hasMongoOperator(req.query)) {
      throw new Error('Arbitrary query operators are strictly prohibited');
    }
    return true;
  }),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('search')
    .optional()
    .isString().withMessage('Search query must be a string')
    .trim()
    .isLength({ max: 100 }).withMessage('Search query must not exceed 100 characters'),
  query('role')
    .optional()
    .isString().withMessage('Role must be a string')
    .isIn(['admin', 'user', 'all']).withMessage('Role must be admin, user, or all'),
  query('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(['active', 'inactive', 'suspended', 'all']).withMessage('Status must be active, inactive, suspended, or all'),
  query('sortBy')
    .optional()
    .isString().withMessage('SortBy must be a string')
    .isIn(['name', 'email', 'role', 'status', 'createdAt']).withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isString().withMessage('Order must be a string')
    .isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  validate,
];

export const userIdParamRules = [
  param('id')
    .isMongoId().withMessage('Invalid user ID format'),
  validate,
];

export const createUserRules = [
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
  body('role')
    .optional()
    .isIn(['admin', 'user']).withMessage('Role must be admin or user'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended']).withMessage('Status must be active, inactive, or suspended'),
  validate,
];

export const updateUserRules = [
  param('id')
    .isMongoId().withMessage('Invalid user ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'user']).withMessage('Role must be admin or user'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended']).withMessage('Status must be active, inactive, or suspended'),
  validate,
];
