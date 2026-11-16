// src/middleware/errorHandler.js
// Centralized error handling middleware — must be registered last.

import { env } from '../config/env.js';

/**
 * Operational error class for intentional, expected API errors.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express error-handling middleware (4-argument signature required).
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.isOperational ? err.message : 'Internal server error';

  // Handle CORS rejection errors
  if (err.message && err.message.startsWith('CORS:')) {
    statusCode = 403;
    message = err.message;
  }

  const body = { success: false, message };

  if (env.isDev) {
    body.stack = err.stack;
    if (!err.isOperational) {
      console.error('[ErrorHandler]', err);
    }
  }

  // Handle express-validator errors forwarded via next(err)
  if (err.type === 'validation') {
    return res.status(422).json({ success: false, message: 'Validation failed', errors: err.errors });
  }

  res.status(statusCode).json(body);
};
