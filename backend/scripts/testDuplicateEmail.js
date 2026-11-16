// scripts/testDuplicateEmail.js
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

await mongoose.connect(process.env.MONGODB_URI);
await User.ensureIndexes();
await User.deleteMany({ email: 'dup.test@test.internal' });

await User.create({ name: 'First', email: 'dup.test@test.internal', password: 'placeholder_hash' });
console.log('First insert: OK');

try {
  await User.create({ name: 'Second', email: 'dup.test@test.internal', password: 'placeholder_hash' });
  console.log('FAIL: duplicate was accepted');
} catch (e) {
  if (e.code === 11000) {
    console.log('Duplicate email rejected with E11000 ✅');
  } else {
    console.log('Unexpected error:', e.message);
  }
}

await User.deleteMany({ email: 'dup.test@test.internal' });
await mongoose.connection.close();
