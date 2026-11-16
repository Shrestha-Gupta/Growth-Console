// src/config/env.js
// Loads and validates environment variables once at startup.

import 'dotenv/config';

const required = ['NODE_ENV', 'PORT', 'JWT_SECRET', 'MONGODB_URI'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`[config] Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv:          process.env.NODE_ENV,
  port:             parseInt(process.env.PORT, 10) || 5000,
  allowedOrigins:   (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean),
  mongoUri:         process.env.MONGODB_URI,
  jwtSecret:        process.env.JWT_SECRET,
  jwtExpiresIn:     process.env.JWT_EXPIRES_IN    || '8h',
  cookieSecret:     process.env.COOKIE_SECRET,
  isDev:            process.env.NODE_ENV === 'development',
  isProd:           process.env.NODE_ENV === 'production',

  // Admin seed (used only by scripts/seedAdmin.js)
  adminSeedName:     process.env.ADMIN_SEED_NAME,
  adminSeedEmail:    process.env.ADMIN_SEED_EMAIL,
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD,
};
