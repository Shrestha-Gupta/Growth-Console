// src/routes/healthRoutes.js
// GET /api/v1/health

import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = Router();

router.get('/', getHealth);

export default router;
