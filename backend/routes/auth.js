const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

// @route   POST api/auth/register-tenant
// @desc    Register a new tenant and an owner user
// @access  Public
router.post('/register-tenant', async (req, res) => {
  const { tenantName, tenantSlug, name, email, password } = req.body;

  if (!tenantName || !tenantSlug || !name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if tenant slug already exists
    let existingTenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase() });
    if (existingTenant) {
      return res.status(400).json({ message: 'Tenant slug is already taken' });
    }

    // Check if user email already exists
    let existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create Tenant
    const tenant = new Tenant({
      name: tenantName,
      slug: tenantSlug.toLowerCase(),
      subscriptionTier: 'Free',
      status: 'Active'
    });
    await tenant.save();

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Owner User
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      tenantId: tenant._id,
      role: 'Owner',
      status: 'Active'
    });
    await user.save();

    // Create Activity Log
    const log = new ActivityLog({
      tenantId: tenant._id,
      userId: user._id,
      userName: user.name,
      action: 'Tenant Created',
      details: `Organization "${tenantName}" was created by ${name}`
    });
    await log.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, tenantId: tenant._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscriptionTier: tenant.subscriptionTier
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during tenant registration' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Find User
    const user = await User.findOne({ email: email.toLowerCase() }).populate('tenantId');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if tenant is suspended
    if (user.tenantId.status === 'Suspended') {
      return res.status(403).json({ message: 'Your organization account is suspended. Contact support.' });
    }

    // Create Activity Log
    const log = new ActivityLog({
      tenantId: user.tenantId._id,
      userId: user._id,
      userName: user.name,
      action: 'User Logged In',
      details: `${user.name} logged into the dashboard`
    });
    await log.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, tenantId: user.tenantId._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      tenant: {
        id: user.tenantId._id,
        name: user.tenantId.name,
        slug: user.tenantId.slug,
        subscriptionTier: user.tenantId.subscriptionTier
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
