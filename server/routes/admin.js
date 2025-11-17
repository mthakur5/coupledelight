const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/auth');

// Admin middleware - checks if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProfiles = await Profile.countDocuments();
    const couplesCount = await User.countDocuments({ accountType: 'couple' });
    const singlesCount = await User.countDocuments({ accountType: 'single' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // Get recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        totalProfiles,
        couplesCount,
        singlesCount,
        verifiedUsers,
        unverifiedUsers
      },
      recentUsers
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users (must be before /users/:userId routes)
router.get('/users/search', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const users = await User.find({
      $or: [
        { email: new RegExp(query, 'i') }
      ]
    })
    .select('-password')
    .limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with pagination
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, accountType, verified } = req.query;
    
    const query = {};
    if (accountType) query.accountType = accountType;
    if (verified !== undefined) query.isEmailVerified = verified === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all profiles with pagination
router.get('/profiles', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, accountType } = req.query;
    
    const query = {};
    if (accountType) query.accountType = accountType;

    const profiles = await Profile.find(query)
      .populate('userId', 'email isVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Profile.countDocuments(query);

    res.json({
      profiles,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user's profile first
    await Profile.findOneAndDelete({ userId });
    
    // Delete user
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User and profile deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete profile
router.delete('/profiles/:profileId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { profileId } = req.params;

    const profile = await Profile.findByIdAndDelete(profileId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user verification status
router.patch('/users/:userId/verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User verification status updated', user });
  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile visibility
router.patch('/profiles/:profileId/visibility', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { isVisible } = req.body;

    const profile = await Profile.findByIdAndUpdate(
      profileId,
      { isVisible },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ message: 'Profile visibility updated', profile });
  } catch (error) {
    console.error('Update visibility error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Make user admin
router.patch('/users/:userId/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated', user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
