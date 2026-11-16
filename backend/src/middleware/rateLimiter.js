// src/middleware/rateLimiter.js
// Rate-limiting for authentication endpoints.

import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15-minute window
  max:      process.env.NODE_ENV === 'production' ? 20 : 500,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many authentication attempts — please try again later',
  },
});
