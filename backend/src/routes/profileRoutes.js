// src/routes/profileRoutes.js
// /api/v1/profile — authenticated user self-service

import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js';
import { updateProfileRules, changePasswordRules }   from '../validators/profileValidator.js';
import { authenticate }                              from '../middleware/authenticate.js';
import { requireActive }                             from '../middleware/authorize.js';

const router = Router();

// All profile routes require authentication AND active account status
router.use(authenticate, requireActive);

// GET  /api/v1/profile
router.get('/', getProfile);

// PATCH /api/v1/profile
router.patch('/', updateProfileRules, updateProfile);

// PATCH /api/v1/profile/password
router.patch('/password', changePasswordRules, changePassword);

export default router;
