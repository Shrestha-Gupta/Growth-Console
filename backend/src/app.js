// src/app.js
// Express application factory — configures all middleware and routes.

import express      from 'express';
import helmet       from 'helmet';
import cors         from 'cors';
import cookieParser from 'cookie-parser';

import { env }            from './config/env.js';
import { requestLogger }  from './middleware/requestLogger.js';
import { notFound }       from './middleware/notFound.js';
import { AppError, errorHandler } from './middleware/errorHandler.js';
import { csrfProtection }         from './middleware/csrfProtection.js';

import healthRoutes  from './routes/healthRoutes.js';
import authRoutes    from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import userRoutes    from './routes/userRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman) in development
    if (!origin && env.isDev) return callback(null, true);
    if (env.allowedOrigins.includes(origin)) return callback(null, true);
    callback(new AppError(`CORS: origin '${origin}' is not permitted`, 403));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-csrf-token'],
  exposedHeaders: ['X-Total-Count'],
}));

// ─── Cookie Parser ────────────────────────────────────────────────────────────
app.use(cookieParser(env.cookieSecret));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── Request Logging ─────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── CSRF Protection ──────────────────────────────────────────────────────────
// Validates Origin and Double-Submit CSRF Token on all state-changing requests
app.use(csrfProtection);

// ─── API v1 Routes ────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/health`,  healthRoutes);
app.use(`${API_PREFIX}/auth`,    authRoutes);
app.use(`${API_PREFIX}/profile`, profileRoutes);
app.use(`${API_PREFIX}/users`,   userRoutes);
app.use(`${API_PREFIX}/metrics`, metricsRoutes);

// ─── 404 & Error Handling ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
