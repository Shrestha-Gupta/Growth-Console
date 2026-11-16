// src/services/userService.js
// Admin user-management business logic with Last Active Admin protection.

import mongoose from 'mongoose';
import User from '../models/User.js';
import AdminGuard from '../models/AdminGuard.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Escapes characters with special meaning in regular expressions.
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * In-process serialization lock to coalesce local requests as an optimization.
 */
let adminMutationLock = Promise.resolve();

const withAdminMutationLock = (action) => {
  const next = adminMutationLock.then(action, action);
  adminMutationLock = next.catch(() => {});
  return next;
};

/**
 * Cache for MongoDB transaction support verification.
 */
let transactionsSupported = null;

export const checkTransactionSupport = async () => {
  if (transactionsSupported !== null) return transactionsSupported;
  try {
    const isReplSet = Boolean(
      mongoose.connection.client?.topology?.description?.setName ||
      mongoose.connection.client?.topology?.description?.type === 'ReplicaSetWithPrimary'
    );
    if (!isReplSet) {
      transactionsSupported = false;
      return false;
    }
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await session.abortTransaction();
      transactionsSupported = true;
    } finally {
      await session.endSession();
    }
  } catch {
    transactionsSupported = false;
  }
  return transactionsSupported;
};

/**
 * Multi-instance transaction strategy with shared guard document (for Replica Set / Mongos).
 * Forces a write conflict on the AdminGuard sentinel document to serialize competing mutations.
 */
const executeWithTransactionGuard = async (action) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(
      async () => {
        // 1. Serialize competing admin mutations through the shared guard document
        await AdminGuard.findOneAndUpdate(
          { key: 'last_active_admin_guard' },
          { $inc: { version: 1 } },
          { session, upsert: true, new: true }
        );

        // 2. Perform protected admin mutation inside the transaction
        result = await action(session);
      },
      {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' },
      }
    );
    return result;
  } finally {
    await session.endSession();
  }
};

/**
 * Ensures sentinel guard document exists without duplicate key races.
 */
const ensureGuardDocument = async (lockKey) => {
  try {
    await AdminGuard.updateOne(
      { key: lockKey },
      { $setOnInsert: { locked: false, version: 0, lockedAt: null, leaseOwner: null } },
      { upsert: true }
    );
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
};

/**
 * Multi-instance distributed atomic lock strategy (for Standalone MongoDB deployments).
 * Uses atomic findOneAndUpdate with safety TTL lease across processes.
 */
const executeWithDistributedGuard = async (action) => {
  const ownerId = `${process.pid}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const lockKey = 'last_active_admin_guard';
  const MAX_RETRIES = 50; // ~5 seconds maximum wait
  const RETRY_INTERVAL = 100;
  const LEASE_DURATION_MS = 10000; // 10 second safety TTL

  await ensureGuardDocument(lockKey);

  let acquired = false;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - LEASE_DURATION_MS);

    // Atomic compare-and-swap via MongoDB findOneAndUpdate (no upsert to prevent E11000)
    const guard = await AdminGuard.findOneAndUpdate(
      {
        key: lockKey,
        $or: [
          { locked: false },
          { lockedAt: { $lt: staleThreshold } },
          { locked: null },
        ],
      },
      {
        $set: {
          locked: true,
          lockedAt: now,
          leaseOwner: ownerId,
        },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (guard && guard.leaseOwner === ownerId) {
      acquired = true;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
  }

  if (!acquired) {
    throw new AppError('Administrative operation lock timeout — concurrent modification in progress.', 409);
  }

  try {
    return await action(null);
  } finally {
    await AdminGuard.updateOne(
      { key: lockKey, leaseOwner: ownerId },
      { $set: { locked: false, leaseOwner: null } }
    ).catch(() => {});
  }
};

/**
 * Executes an administrative mutation using the strongest available concurrency strategy.
 */
export const executeAdminMutation = async (action) => {
  return withAdminMutationLock(async () => {
    const canUseTransactions = await checkTransactionSupport();
    if (canUseTransactions) {
      return executeWithTransactionGuard(action);
    } else {
      return executeWithDistributedGuard(action);
    }
  });
};

/**
 * Fetch a paginated, filtered, and sorted list of users.
 */
export const getUsersList = async ({
  page = 1,
  limit = 10,
  search = '',
  role = 'all',
  status = 'all',
  sortBy = 'createdAt',
  order = 'desc',
}) => {
  const query = {};

  // Search filter across name or email with regex escaping
  if (typeof search === 'string' && search.trim()) {
    const escaped = escapeRegex(search.trim().slice(0, 100));
    const searchRegex = new RegExp(escaped, 'i');
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  // Whitelist role filter
  if (typeof role === 'string' && ['admin', 'user'].includes(role)) {
    query.role = role;
  }

  // Whitelist status filter
  if (typeof status === 'string' && ['active', 'inactive', 'suspended'].includes(status)) {
    query.status = status;
  }

  // Whitelist sortable fields
  const ALLOWED_SORT_FIELDS = ['name', 'email', 'role', 'status', 'createdAt'];
  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
  const sortDirection = order === 'asc' ? 1 : -1;
  const sortOptions = { [safeSortBy]: sortDirection };

  // Validate pagination values
  const safePage = Number.isInteger(page) && page >= 1 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit >= 1 && limit <= 100 ? limit : 10;
  const skip = (safePage - 1) * safeLimit;

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(safeLimit)
      .select('-__v'),
  ]);

  const totalPages = Math.ceil(total / safeLimit) || 1;

  return {
    users,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasPrevPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
  };
};

/**
 * Get a single user document by ID (excluding password).
 */
export const getUserById = async (id) => {
  const user = await User.findById(id).select('-__v');
  if (!user) {
    throw new AppError('User record not found', 404);
  }
  return user;
};

/**
 * Create a new user account through the administrative console.
 */
export const createUserByAdmin = async ({ name, email, password, role = 'user', status = 'active' }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    status,
  });

  return user;
};

/**
 * Update a user account by ID with Last Active Admin Protection.
 * Uses MongoDB-backed concurrency guard across multiple backend instances.
 */
export const updateUserByAdmin = async (id, data) => {
  return executeAdminMutation(async (session) => {
    const user = await User.findById(id).session(session);
    if (!user) {
      throw new AppError('User record not found', 404);
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: data.email.toLowerCase(), _id: { $ne: id } }).session(session);
      if (existing) {
        throw new AppError('An account with this email already exists', 409);
      }
      user.email = data.email.toLowerCase();
    }

    // ─── Last Active Administrator Protection Safeguard ───────────────────────
    const isCurrentActiveAdmin = user.role === 'admin' && user.status === 'active';
    const isDemoting = data.role && data.role !== 'admin';
    const isDeactivating = data.status && data.status !== 'active';

    if (isCurrentActiveAdmin && (isDemoting || isDeactivating)) {
      const remainingActiveAdmins = await User.countDocuments({
        role: 'admin',
        status: 'active',
        _id: { $ne: id },
      }).session(session);
      if (remainingActiveAdmins === 0) {
        throw new AppError(
          'Protection Violation: Cannot demote or deactivate the sole remaining active administrator.',
          400
        );
      }
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.role !== undefined) user.role = data.role;
    if (data.status !== undefined) user.status = data.status;
    if (data.password) {
      user.password = data.password; // Mongoose pre-save hook will hash with bcrypt
    }

    await user.save(session ? { session } : {});
    return user;
  });
};

/**
 * Delete a user account by ID with Last Active Admin Protection.
 * Uses MongoDB-backed concurrency guard across multiple backend instances.
 */
export const deleteUserByAdmin = async (id) => {
  return executeAdminMutation(async (session) => {
    const user = await User.findById(id).session(session);
    if (!user) {
      throw new AppError('User record not found', 404);
    }

    // ─── Last Active Administrator Protection Safeguard ───────────────────────
    if (user.role === 'admin' && user.status === 'active') {
      const remainingActiveAdmins = await User.countDocuments({
        role: 'admin',
        status: 'active',
        _id: { $ne: id },
      }).session(session);
      if (remainingActiveAdmins === 0) {
        throw new AppError(
          'Protection Violation: Cannot delete the sole remaining active administrator.',
          400
        );
      }
    }

    await User.findByIdAndDelete(id, session ? { session } : {});
    return { id, email: user.email };
  });
};
