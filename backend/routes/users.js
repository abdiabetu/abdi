const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @route   GET api/users
// @desc    Get all users in the tenant organization
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.user.tenantId })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving organization members' });
  }
});

// @route   POST api/users
// @desc    Add / invite a new member to the tenant organization
// @access  Private (Owner or Admin only)
router.post('/', auth, async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Auth check: Admin or Owner only
  if (req.user.role !== 'Owner' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied: Only admins/owners can invite users' });
  }

  // Prevent admin from creating an Owner
  if (role === 'Owner' && req.user.role !== 'Owner') {
    return res.status(403).json({ message: 'Access denied: Only organization owners can designate other owners' });
  }

  try {
    // Check if user email already exists globally
    let existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      tenantId: req.user.tenantId,
      role,
      status: 'Active'
    });

    await newUser.save();

    // Log the invite
    const inviter = await User.findById(req.user.id);
    const log = new ActivityLog({
      tenantId: req.user.tenantId,
      userId: req.user.id,
      userName: inviter ? inviter.name : 'Authorized User',
      action: 'Member Invited',
      details: `User "${name}" (${email}) was added as a ${role}`
    });
    await log.save();

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating organization member' });
  }
});

// @route   PUT api/users/:id
// @desc    Update a user's role or status
// @access  Private (Owner or Admin only)
router.put('/:id', auth, async (req, res) => {
  const { role, status } = req.body;
  const targetUserId = req.params.id;

  if (req.user.role !== 'Owner' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
  }

  try {
    const user = await User.findOne({ _id: targetUserId, tenantId: req.user.tenantId });
    if (!user) {
      return res.status(404).json({ message: 'User not found in this organization' });
    }

    // Protection logic
    if (user.role === 'Owner' && req.user.id !== targetUserId) {
      return res.status(403).json({ message: 'Access denied: Cannot modify another organization owner' });
    }

    if (role && role !== user.role) {
      // Only Owner can promote/demote owners
      if ((role === 'Owner' || user.role === 'Owner') && req.user.role !== 'Owner') {
        return res.status(403).json({ message: 'Access denied: Only owners can modify owner designation' });
      }
      user.role = role;
    }

    if (status) {
      user.status = status;
    }

    await user.save();

    // Log action
    const actor = await User.findById(req.user.id);
    const log = new ActivityLog({
      tenantId: req.user.tenantId,
      userId: req.user.id,
      userName: actor ? actor.name : 'Authorized User',
      action: 'Member Updated',
      details: `User "${user.name}" updated: Role = ${user.role}, Status = ${user.status}`
    });
    await log.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating user configuration' });
  }
});

// @route   DELETE api/users/:id
// @desc    Remove a member from the organization
// @access  Private (Owner or Admin only)
router.delete('/:id', auth, async (req, res) => {
  const targetUserId = req.params.id;

  if (req.user.role !== 'Owner' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
  }

  try {
    const user = await User.findOne({ _id: targetUserId, tenantId: req.user.tenantId });
    if (!user) {
      return res.status(404).json({ message: 'User not found in this organization' });
    }

    // Owner deletion check
    if (user.role === 'Owner') {
      return res.status(403).json({ message: 'Cannot delete the organization owner' });
    }

    await User.findByIdAndDelete(targetUserId);

    // Log deletion
    const actor = await User.findById(req.user.id);
    const log = new ActivityLog({
      tenantId: req.user.tenantId,
      userId: req.user.id,
      userName: actor ? actor.name : 'Authorized User',
      action: 'Member Removed',
      details: `User "${user.name}" (${user.email}) was removed from organization`
    });
    await log.save();

    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting member' });
  }
});

module.exports = router;
