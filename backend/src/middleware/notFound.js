// src/middleware/notFound.js
// Catches all unmatched routes and forwards a 404 AppError.

import { AppError } from './errorHandler.js';

export const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
