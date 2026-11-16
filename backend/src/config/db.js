// src/config/db.js
// Mongoose connection — connects once at startup, handles errors and reconnection.

import mongoose from 'mongoose';
import { env }  from './env.js';

// Connection state labels for health reporting
const STATE = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

export const getDbState = () => STATE[mongoose.connection.readyState] ?? 'unknown';

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:          45000,
    });

    const { host, port, name } = mongoose.connection;
    console.log(`[db] MongoDB connected — ${host}:${port}/${name}`);

    mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'));
    mongoose.connection.on('reconnected',  () => console.log('[db]  MongoDB reconnected'));
    mongoose.connection.on('error',        (err) => console.error('[db] MongoDB error:', err.message));

  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('[db] MongoDB connection closed');
};
