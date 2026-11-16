// src/controllers/healthController.js
// Health-check endpoint — reports live database connectivity from Phase 5 onward.

import { ApiResponse } from '../utils/ApiResponse.js';
import { env }         from '../config/env.js';
import { getDbState }  from '../config/db.js';

export const getHealth = (_req, res) => {
  const dbState = getDbState();

  ApiResponse.ok(res, 'Growth Console API is operational', {
    status:      dbState === 'connected' ? 'ok' : 'degraded',
    environment: env.nodeEnv,
    timestamp:   new Date().toISOString(),
    version:     '1.0.0',
    services: {
      database: dbState,
      auth:     'pending — Phase 6',
    },
  });
};
