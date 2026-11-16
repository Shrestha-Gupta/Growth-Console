// src/routes/authRoutes.js
// /api/v1/auth — authentication endpoints

import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  getCsrfToken,
} from '../controllers/authController.js';
import { registerRules, loginRules } from '../validators/authValidator.js';
import { authenticate }              from '../middleware/authenticate.js';
import { authLimiter }               from '../middleware/rateLimiter.js';

const router = Router();

// GET  /api/v1/auth/csrf-token — public, returns CSRF token & sets cookie
router.get('/csrf-token', getCsrfToken);

// POST /api/v1/auth/register  — public, rate-limited, CSRF-protected
router.post('/register', authLimiter, registerRules, register);

// POST /api/v1/auth/login     — public, rate-limited, CSRF-protected
router.post('/login', authLimiter, loginRules, login);

// GET  /api/v1/auth/me        — authenticated
router.get('/me', authenticate, getMe);

// POST /api/v1/auth/logout    — authenticated, CSRF-protected
router.post('/logout', authenticate, logout);

export default router;
