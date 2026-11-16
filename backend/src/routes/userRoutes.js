// src/routes/userRoutes.js
// /api/v1/users — admin user-management endpoints (Phase 7 implementation)

import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize, requireActive } from '../middleware/authorize.js';
import {
  listUsersRules,
  userIdParamRules,
  createUserRules,
  updateUserRules,
} from '../validators/userValidator.js';

const router = Router();

// All user-management routes require: authenticated + active + admin
router.use(authenticate, requireActive, authorize('admin'));

// GET  /api/v1/users          — paginated, filtered, sorted
router.get('/', listUsersRules, listUsers);

// POST /api/v1/users          — admin user creation
router.post('/', createUserRules, createUser);

// GET  /api/v1/users/:id      — single user details
router.get('/:id', userIdParamRules, getUser);

// PATCH /api/v1/users/:id     — admin user update
router.patch('/:id', updateUserRules, updateUser);

// DELETE /api/v1/users/:id    — admin user deletion
router.delete('/:id', userIdParamRules, deleteUser);

export default router;
