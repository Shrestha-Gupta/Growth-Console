// src/middleware/requestLogger.js
// Morgan-based HTTP request logger.
// In development: colourised 'dev' format.
// In production:  'combined' Apache-style format.

import morgan from 'morgan';
import { env } from '../config/env.js';

export const requestLogger = morgan(env.isDev ? 'dev' : 'combined');
