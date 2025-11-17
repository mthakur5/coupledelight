const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get all profiles (with filters)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { lookingFor, accountType, minAge, maxAge, location } = req.query;
    
    // Get current user and their profile
    const currentUser = await User.findById(req.userId);
    const currentProfile = await Profile.findOne({ userId: req.userId });
    
    // Build query based on user type
    let query = {
      userId: { $ne: req.userId }, // Exclude own profile
      isVisible: true,
      isComplete: true
    };

    // Apply discovery logic based on account type
    if (currentUser.accountType === 'couple') {
      // Couples see only singles (boys and girls)
      query.accountType = 'single';
    } else if (currentUser.accountType === 'single') {
      // Singles see couples and opposite gender singles
      if (currentProfile && currentProfile.gender === 'male') {
        // Boys see couples and girls
        query.$or = [
          { accountType: 'couple' },
          { accountType: 'single', gender: { $in: ['female', 'other'] } }
        ];
      } else if (currentProfile && currentProfile.gender === 'female') {
        // Girls see everyone (couples, boys, and girls)
        // No restriction needed - they see all
      } else {
        // For 'other' gender, show couples and all singles
        // No restriction needed
      }
    }

    if (lookingFor) {
      query.lookingFor = { $in: [lookingFor, 'any'] };
    }

    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }

    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }

    const profiles = await Profile.find(query)
      .select('-userId')
      .limit(50)
      .sort({ createdAt: -1 });

    res.json({ profiles, count: profiles.length });
  } catch (error) {
    console.error('Discover profiles error:', error);
    res.status(500).json({ message: 'Server error while fetching profiles' });
  }
});

// Search profiles
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query: searchQuery } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const profiles = await Profile.find({
      userId: { $ne: req.userId },
      isVisible: true,
      isComplete: true,
      $or: [
        { name: new RegExp(searchQuery, 'i') },
        { coupleName: new RegExp(searchQuery, 'i') },
        { bio: new RegExp(searchQuery, 'i') },
        { interests: new RegExp(searchQuery, 'i') }
      ]
    })
    .select('-userId')
    .limit(20);

    res.json({ profiles, count: profiles.length });
  } catch (error) {
    console.error('Search profiles error:', error);
    res.status(500).json({ message: 'Server error while searching profiles' });
  }
});

module.exports = router;
