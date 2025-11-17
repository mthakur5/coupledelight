const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/auth');

// Get current user's profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    const profileData = {
      ...req.body,
      userId: req.userId,
      accountType: req.user.accountType
    };

    // Check if profile already exists
    let profile = await Profile.findOne({ userId: req.userId });

    if (profile) {
      // Update existing profile
      Object.assign(profile, profileData);
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile(profileData);
      await profile.save();
    }

    res.json({
      message: profile.isNew ? 'Profile created successfully' : 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ message: 'Server error while saving profile' });
  }
});

// Update profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update profile fields
    Object.assign(profile, req.body);
    await profile.save();

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// Get profile by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile || !profile.isVisible) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete profile
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    await Profile.deleteOne({ userId: req.userId });

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ message: 'Server error while deleting profile' });
  }
});

module.exports = router;
