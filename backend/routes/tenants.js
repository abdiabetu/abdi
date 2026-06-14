const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tenant = require('../models/Tenant');
const ActivityLog = require('../models/ActivityLog');

// @route   GET api/tenants/me
// @desc    Get current tenant details
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving tenant settings' });
  }
});

// @route   PUT api/tenants/me
// @desc    Update tenant settings
// @access  Private (Owner or Admin only)
router.put('/me', auth, async (req, res) => {
  const { name, slug, subscriptionTier } = req.body;

  // Role check
  if (req.user.role !== 'Owner' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied: Insufficient permissions to update tenant configuration' });
  }

  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Check slug availability if changed
    if (slug && slug.toLowerCase() !== tenant.slug) {
      const existing = await Tenant.findOne({ slug: slug.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: 'Tenant slug is already in use' });
      }
      tenant.slug = slug.toLowerCase();
    }

    if (name) tenant.name = name;
    
    // Only Owners can change the subscription tier
    if (subscriptionTier && subscriptionTier !== tenant.subscriptionTier) {
      if (req.user.role !== 'Owner') {
        return res.status(403).json({ message: 'Only organization owners can modify subscription tiers' });
      }
      tenant.subscriptionTier = subscriptionTier;
    }

    await tenant.save();

    // Log this action
    const log = new ActivityLog({
      tenantId: tenant._id,
      userId: req.user.id,
      userName: 'Authorized User', // We don't have the user's full name in JWT, we can query it or use a default, let's keep it simple
      action: 'Tenant Updated',
      details: `Settings updated: Name = "${tenant.name}", Tier = "${tenant.subscriptionTier}"`
    });
    
    // Try to get user's actual name to make log clean
    const User = require('../models/User');
    const userObj = await User.findById(req.user.id);
    if (userObj) {
      log.userName = userObj.name;
    }
    await log.save();

    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating tenant settings' });
  }
});

module.exports = router;
