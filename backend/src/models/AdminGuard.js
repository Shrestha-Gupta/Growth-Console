// src/models/AdminGuard.js
// MongoDB-backed sentinel guard document for concurrency control & transaction write-conflicts.

import mongoose from 'mongoose';

const adminGuardSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    version: {
      type: Number,
      default: 0,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    leaseOwner: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const AdminGuard = mongoose.models.AdminGuard || mongoose.model('AdminGuard', adminGuardSchema);

export default AdminGuard;
