const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accountType: {
    type: String,
    enum: ['single', 'couple'],
    required: true
  },
  // Common fields
  bio: {
    type: String,
    maxlength: 500
  },
  age: {
    type: Number,
    min: 18,
    max: 100
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  interests: [String],
  profilePicture: {
    type: String,
    default: ''
  },
  profilePictureBlur: {
    type: Boolean,
    default: false
  },
  photos: [{
    type: String
  }],
  lookingFor: {
    type: String,
    enum: ['couple', 'single_male', 'single_female', 'any']
  },
  
  // Single profile fields
  name: String,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Couple profile fields
  coupleName: String,
  partner1: {
    name: String,
    age: Number,
    gender: String
  },
  partner2: {
    name: String,
    age: Number,
    gender: String
  },
  relationshipStatus: {
    type: String,
    enum: ['dating', 'engaged', 'married', 'open_relationship']
  },
  
  isComplete: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
