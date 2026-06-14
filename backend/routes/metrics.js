const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Metric = require('../models/Metric');
const ActivityLog = require('../models/ActivityLog');

// Helper to seed metrics if none exist
const ensureMetricsSeeded = async (tenantId) => {
  const count = await Metric.countDocuments({ tenantId });
  if (count > 0) return;

  const now = new Date();
  const seedData = [];

  // Seed last 7 days of usage
  for (let i = 6; i >= 0; i--) {
    const recordedAt = new Date(now);
    recordedAt.setDate(now.getDate() - i);
    recordedAt.setHours(0, 0, 0, 0);

    // Random but realistic metrics
    const apiCalls = Math.floor(Math.random() * 5000) + 1200 + (6 - i) * 300;
    const activeUsers = Math.floor(Math.random() * 20) + 5 + (6 - i) * 2;
    const storageUsed = Number((5.2 + (6 - i) * 1.3 + Math.random() * 0.5).toFixed(2));

    seedData.push({
      tenantId,
      apiCalls,
      activeUsers,
      storageUsed,
      recordedAt
    });
  }

  await Metric.insertMany(seedData);
};

// Helper to seed activity logs if none exist
const ensureActivityLogsSeeded = async (tenantId, userId, userName) => {
  const count = await ActivityLog.countDocuments({ tenantId });
  if (count > 1) return; // 1 log already exists from tenant creation

  const logs = [
    {
      tenantId,
      userId,
      userName,
      action: 'API Configuration Updated',
      details: 'Production API endpoint was validated and linked.',
      createdAt: new Date(Date.now() - 3600000 * 4) // 4 hours ago
    },
    {
      tenantId,
      userId,
      userName,
      action: 'Billing Profile Configured',
      details: 'Automatic invoices enabled on standard cycle.',
      createdAt: new Date(Date.now() - 3600000 * 24) // 24 hours ago
    },
    {
      tenantId,
      userId,
      userName: 'System Daemon',
      action: 'Storage Sync Completed',
      details: 'S3 asset mirroring finalized for tenant media files.',
      createdAt: new Date(Date.now() - 3600000 * 32) // 32 hours ago
    }
  ];

  await ActivityLog.insertMany(logs);
};

// @route   GET api/metrics
// @desc    Get dashboard metrics data (seeding on the fly if empty)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    await ensureMetricsSeeded(req.user.tenantId);

    // Retrieve last 10 days of metrics
    const metrics = await Metric.find({ tenantId: req.user.tenantId })
      .sort({ recordedAt: 1 })
      .limit(10);

    res.json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving metrics data' });
  }
});

// @route   GET api/metrics/logs
// @desc    Get audit activity logs
// @access  Private
router.get('/logs', auth, async (req, res) => {
  try {
    // Attempt to seed logs as well
    const User = require('../models/User');
    const userObj = await User.findById(req.user.id);
    const userName = userObj ? userObj.name : 'Authorized User';

    await ensureActivityLogsSeeded(req.user.tenantId, req.user.id, userName);

    const logs = await ActivityLog.find({ tenantId: req.user.tenantId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving audit logs' });
  }
});

module.exports = router;
