// src/routes/metricsRoutes.js
// /api/v1/metrics — admin analytics endpoints (Phase 7 implementation)

import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/metricsController.js';
import { authenticate }                from '../middleware/authenticate.js';
import { authorize, requireActive }    from '../middleware/authorize.js';

const router = Router();

// All metrics routes require: authenticated + active + admin
router.use(authenticate, requireActive, authorize('admin'));

// GET /api/v1/metrics/dashboard
router.get('/dashboard', getDashboardMetrics);

export default router;
