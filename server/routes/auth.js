const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/email');

// Register
router.post('/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      accountType,
      name,
      age,
      gender,
      partner1Name,
      partner1Age,
      partner1Gender,
      partner2Name,
      partner2Age,
      partner2Gender,
      relationshipType
    } = req.body;

    // Validate input
    if (!email || !password || !accountType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['single', 'couple'].includes(accountType)) {
      return res.status(400).json({ message: 'Invalid account type' });
    }

    // Validate account-specific fields
    if (accountType === 'single') {
      if (!name || !age || !gender) {
        return res.status(400).json({ message: 'Please provide name, age, and gender' });
      }
    }

    if (accountType === 'couple') {
      if (!partner1Name || !partner1Age || !partner1Gender || 
          !partner2Name || !partner2Age || !partner2Gender || !relationshipType) {
        return res.status(400).json({ message: 'Please provide both partners details' });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = new User({
      email,
      password,
      accountType,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    await user.save();

    // Create profile with registration details
    const profileData = {
      userId: user._id,
      accountType,
      age: accountType === 'single' ? parseInt(age) : undefined,
      isComplete: false
    };

    if (accountType === 'single') {
      profileData.name = name;
      profileData.gender = gender;
    } else {
      profileData.coupleName = `${partner1Name} & ${partner2Name}`;
      profileData.partner1 = {
        name: partner1Name,
        age: parseInt(partner1Age),
        gender: partner1Gender
      };
      profileData.partner2 = {
        name: partner2Name,
        age: parseInt(partner2Age),
        gender: partner2Gender
      };
      profileData.relationshipStatus = relationshipType;
    }

    const profile = new Profile(profileData);
    await profile.save();

    // Send verification email
    const userName = accountType === 'single' ? name : `${partner1Name} & ${partner2Name}`;
    await sendVerificationEmail(email, verificationToken, userName);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      token,
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email }).maxTimeMS(5000);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now use all features.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// Resend verification email
router.post('/resend-verification', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Get user name from profile
    const profile = await Profile.findOne({ userId: user._id });
    const userName = user.accountType === 'single' 
      ? profile?.name 
      : profile?.coupleName || 'User';

    await sendVerificationEmail(user.email, verificationToken, userName);

    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        accountType: req.user.accountType,
        isEmailVerified: req.user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
