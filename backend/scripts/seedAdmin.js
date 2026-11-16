// scripts/seedAdmin.js
// Idempotent admin seed — creates the initial administrator from env vars.
// Usage: npm run seed:admin

import 'dotenv/config';
import mongoose from 'mongoose';
import User     from '../src/models/User.js';

const { MONGODB_URI, ADMIN_SEED_NAME, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD } = process.env;

if (!ADMIN_SEED_NAME || !ADMIN_SEED_EMAIL || !ADMIN_SEED_PASSWORD) {
  console.error('[seed] Missing ADMIN_SEED_NAME, ADMIN_SEED_EMAIL, or ADMIN_SEED_PASSWORD in .env');
  process.exit(1);
}

if (ADMIN_SEED_PASSWORD.length < 8) {
  console.error('[seed] ADMIN_SEED_PASSWORD must be at least 8 characters');
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('[seed] Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_SEED_EMAIL.toLowerCase() });

  if (existing) {
    console.log(`[seed] Administrator already exists: ${existing.email} (${existing.role}/${existing.status})`);
  } else {
    const admin = await User.create({
      name:     ADMIN_SEED_NAME,
      email:    ADMIN_SEED_EMAIL,
      password: ADMIN_SEED_PASSWORD,
      role:     'admin',
      status:   'active',
    });
    console.log(`[seed] Administrator created: ${admin.email}`);
  }

  await mongoose.connection.close();
  process.exit(0);
} catch (err) {
  console.error('[seed] Error:', err.message);
  process.exit(1);
}
