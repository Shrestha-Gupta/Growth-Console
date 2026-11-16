// src/models/User.js
// Mongoose User model — matches the approved schema in Blueprint v2.0.

import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const SALT_ROUNDS = 12;
const { Schema }  = mongoose;

const userSchema = new Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [80, 'Name must not exceed 80 characters'],
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      select:    false,
      minlength: [8, 'Password must be at least 8 characters'],
    },

    role: {
      type:    String,
      enum:    {
        values:  ['admin', 'user'],
        message: 'Role must be either admin or user',
      },
      default: 'user',
    },

    status: {
      type:    String,
      enum:    {
        values:  ['active', 'inactive', 'suspended'],
        message: 'Status must be active, inactive, or suspended',
      },
      default: 'active',
    },

    lastLogin: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps:  true,
    versionKey:  false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

// ─── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre('save', async function () {
  // Only hash if password was modified (covers create and password change)
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// ─── Instance method: compare password ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Serialization guard ──────────────────────────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
