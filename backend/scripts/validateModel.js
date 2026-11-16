// scripts/validateModel.js
// One-shot validation script — run manually, never in production.
// Tests: required fields, enum constraints, duplicate email, password exclusion.

import 'dotenv/config';
import mongoose from 'mongoose';
import User     from '../src/models/User.js';

const URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 });
  console.log('\n[validate] Connected to MongoDB\n');

  // ── Clean up any leftovers from a previous run ─────────────────────────────
  await User.deleteMany({ email: { $in: ['validate.a@test.internal', 'validate.b@test.internal'] } });

  let pass = 0, fail = 0;

  const check = (label, result) => {
    if (result) { console.log(`  ✅  ${label}`); pass++; }
    else        { console.error(`  ❌  ${label}`); fail++; }
  };

  // 1. Missing required fields
  try {
    await User.create({});
    check('Missing required fields → ValidationError', false);
  } catch (e) {
    check('Missing required fields → ValidationError', e.name === 'ValidationError');
  }

  // 2. Invalid email format
  try {
    await User.create({ name: 'Test', email: 'not-an-email', password: 'password123' });
    check('Invalid email format → ValidationError', false);
  } catch (e) {
    check('Invalid email format → ValidationError', e.name === 'ValidationError');
  }

  // 3. Invalid role enum
  try {
    await User.create({ name: 'Test', email: 'validate.a@test.internal', password: 'password123', role: 'superadmin' });
    check('Invalid role enum → ValidationError', false);
  } catch (e) {
    check('Invalid role enum → ValidationError', e.name === 'ValidationError');
  }

  // 4. Invalid status enum
  try {
    await User.create({ name: 'Test', email: 'validate.a@test.internal', password: 'password123', status: 'banned' });
    check('Invalid status enum → ValidationError', false);
  } catch (e) {
    check('Invalid status enum → ValidationError', e.name === 'ValidationError');
  }

  // 5. Valid user creation + email lowercased
  let userA;
  try {
    userA = await User.create({ name: 'Test User A', email: 'Validate.A@test.internal', password: 'placeholder_hash_123', role: 'user', status: 'active' });
    check('Valid user created with defaults', userA._id && userA.role === 'user' && userA.status === 'active');
    check('Email normalized to lowercase',   userA.email === 'validate.a@test.internal');
  } catch (e) {
    check('Valid user created', false);
    console.error('    ', e.message);
  }

  // 6. Password excluded from ordinary find
  try {
    const found = await User.findOne({ email: 'validate.a@test.internal' });
    check('Password excluded from ordinary find', found && found.password === undefined);
  } catch (e) {
    check('Password excluded from ordinary find', false);
  }

  // 7. toJSON also strips password
  try {
    const found = await User.findOne({ email: 'validate.a@test.internal' }).select('+password');
    const json  = found.toJSON();
    check('toJSON strips password field', json.password === undefined);
  } catch (e) {
    check('toJSON strips password field', false);
  }

  // 8. Timestamps present
  try {
    const found = await User.findOne({ email: 'validate.a@test.internal' });
    check('Timestamps (createdAt / updatedAt) present', found && found.createdAt instanceof Date && found.updatedAt instanceof Date);
  } catch (e) {
    check('Timestamps present', false);
  }

  // 9. Duplicate email rejected
  try {
    await User.create({ name: 'Duplicate', email: 'validate.a@test.internal', password: 'placeholder_hash_123' });
    check('Duplicate email → MongoServerError (E11000)', false);
  } catch (e) {
    check('Duplicate email → MongoServerError (E11000)', e.code === 11000);
  }

  // 10. Admin role assignment
  try {
    const adminUser = await User.create({ name: 'Test Admin', email: 'validate.b@test.internal', password: 'placeholder_hash_123', role: 'admin' });
    check('Admin role set correctly', adminUser.role === 'admin');
  } catch (e) {
    check('Admin role set correctly', false);
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────
  await User.deleteMany({ email: { $in: ['validate.a@test.internal', 'validate.b@test.internal'] } });
  console.log('\n[validate] Test documents cleaned up');

  console.log(`\n  Results: ${pass} passed, ${fail} failed\n`);
  await mongoose.connection.close();
  process.exit(fail > 0 ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
