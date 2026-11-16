// src/controllers/metricsController.js
// Dashboard metrics controller handler.

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getSystemMetrics } from '../services/metricsService.js';

/**
 * GET /api/v1/metrics/dashboard
 * Administrative dashboard metrics and telemetry.
 */
export const getDashboardMetrics = asyncHandler(async (_req, res) => {
  const data = await getSystemMetrics();
  ApiResponse.ok(res, 'Dashboard metrics retrieved successfully', data);
});
