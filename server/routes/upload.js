const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const Profile = require('../models/Profile');
const fs = require('fs');
const path = require('path');

// Upload profile picture
router.post('/profile-picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = `/uploads/profiles/${req.file.filename}`;
    
    // Update profile with new profile picture
    const profile = await Profile.findOne({ userId: req.userId });
    
    if (!profile) {
      // Delete uploaded file if profile doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Delete old profile picture if exists
    if (profile.profilePicture) {
      const oldPath = path.join(__dirname, '..', profile.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    profile.profilePicture = filePath;
    await profile.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: filePath
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

// Upload additional photos (max 5)
router.post('/photos', authMiddleware, upload.array('photos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const profile = await Profile.findOne({ userId: req.userId });
    
    if (!profile) {
      // Delete uploaded files if profile doesn't exist
      req.files.forEach(file => fs.unlinkSync(file.path));
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if adding new photos exceeds limit
    const currentPhotosCount = profile.photos ? profile.photos.length : 0;
    const newPhotosCount = req.files.length;
    
    if (currentPhotosCount + newPhotosCount > 5) {
      req.files.forEach(file => fs.unlinkSync(file.path));
      return res.status(400).json({ 
        message: `You can only have 5 photos. You currently have ${currentPhotosCount} photos.` 
      });
    }

    // Add new photos
    const newPhotoPaths = req.files.map(file => `/uploads/photos/${file.filename}`);
    profile.photos = [...(profile.photos || []), ...newPhotoPaths];
    await profile.save();

    res.json({
      message: 'Photos uploaded successfully',
      photos: profile.photos
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    if (req.files) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    res.status(500).json({ message: 'Failed to upload photos' });
  }
});

// Delete profile picture
router.delete('/profile-picture', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!profile.profilePicture) {
      return res.status(400).json({ message: 'No profile picture to remove' });
    }

    // Delete file from filesystem
    const photoPath = path.join(__dirname, '..', profile.profilePicture);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    // Remove from database
    profile.profilePicture = null;
    profile.profilePictureBlur = false;
    await profile.save();

    res.json({
      message: 'Profile picture removed successfully'
    });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({ message: 'Failed to remove profile picture' });
  }
});

// Delete a photo
router.delete('/photos/:index', authMiddleware, async (req, res) => {
  try {
    const { index } = req.params;
    const photoIndex = parseInt(index);

    const profile = await Profile.findOne({ userId: req.userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!profile.photos || photoIndex < 0 || photoIndex >= profile.photos.length) {
      return res.status(400).json({ message: 'Invalid photo index' });
    }

    // Delete file from filesystem
    const photoPath = path.join(__dirname, '..', profile.photos[photoIndex]);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    // Remove from database
    profile.photos.splice(photoIndex, 1);
    await profile.save();

    res.json({
      message: 'Photo deleted successfully',
      photos: profile.photos
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Failed to delete photo' });
  }
});

module.exports = router;
