// src/server.js
// Application entry point — connects to MongoDB then starts the HTTP server.

import { env }         from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import app             from './app.js';

// Connect to MongoDB first, then bind HTTP server
await connectDB();

const server = app.listen(env.port, () => {
  console.log(`\n🚀 Growth Console API`);
  console.log(`   Environment : ${env.nodeEnv}`);
  console.log(`   Port        : ${env.port}`);
  console.log(`   Health      : http://localhost:${env.port}/api/v1/health`);
  console.log(`   CORS origins: ${env.allowedOrigins.join(', ')}\n`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n[server] ${signal} received — shutting down gracefully`);
  server.close(async () => {
    await disconnectDB();
    console.log('[server] HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
  shutdown('unhandledRejection');
});
