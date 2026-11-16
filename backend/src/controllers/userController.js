// src/controllers/userController.js
// Admin user-management controller handlers.

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  getUsersList,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} from '../services/userService.js';

/**
 * GET /api/v1/users
 * Paginated, filtered, and sorted user listing.
 */
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role, status, sortBy, order } = req.query;

  const result = await getUsersList({
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
    search: search || '',
    role: role || 'all',
    status: status || 'all',
    sortBy: sortBy || 'createdAt',
    order: order || 'desc',
  });

  res.setHeader('X-Total-Count', result.pagination.total);

  ApiResponse.ok(res, 'Users retrieved successfully', result.users, result.pagination);
});

/**
 * GET /api/v1/users/:id
 * Retrieve a single user record by ID.
 */
export const getUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  ApiResponse.ok(res, 'User retrieved successfully', { user: user.toJSON() });
});

/**
 * POST /api/v1/users
 * Administrative user creation.
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, status } = req.body;
  const user = await createUserByAdmin({ name, email, password, role, status });
  ApiResponse.created(res, 'User created successfully', { user: user.toJSON() });
});

/**
 * PATCH /api/v1/users/:id
 * Administrative user update with last-active-admin safeguard.
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await updateUserByAdmin(req.params.id, req.body);
  ApiResponse.ok(res, 'User updated successfully', { user: user.toJSON() });
});

/**
 * DELETE /api/v1/users/:id
 * Administrative user deletion with last-active-admin safeguard.
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const result = await deleteUserByAdmin(req.params.id);
  ApiResponse.ok(res, 'User deleted successfully', result);
});
