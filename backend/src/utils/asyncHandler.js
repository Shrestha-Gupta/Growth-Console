// src/utils/asyncHandler.js
// Wraps async route handlers to forward errors to Express error middleware.

/**
 * @param {Function} fn  Async express route handler
 * @returns {Function}   Wrapped handler that catches rejections
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
