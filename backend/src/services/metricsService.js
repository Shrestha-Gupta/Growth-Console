// src/services/metricsService.js
// Dashboard metrics calculation using real MongoDB aggregation telemetry.

import User from '../models/User.js';

export const getSystemMetrics = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    adminUsers,
    recentRegistrations,
    dailyAggregates,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ status: 'inactive' }),
    User.countDocuments({ status: 'suspended' }),
    User.countDocuments({ role: 'admin' }),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role status createdAt')
      .lean(),
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Convert daily aggregates to a map for quick lookup
  const countMap = new Map();
  for (const item of dailyAggregates) {
    countMap.set(item._id, item.count);
  }

  // Build full 30-day series ensuring all days are represented
  const trend = [];
  const currentDate = new Date(thirtyDaysAgo);
  const now = new Date();

  while (currentDate <= now) {
    const dateStr = currentDate.toISOString().split('T')[0];
    trend.push({
      date: dateStr,
      count: countMap.get(dateStr) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    metrics: {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      adminUsers,
    },
    recentRegistrations,
    trend,
  };
};
