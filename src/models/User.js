/**
 * User Model
 * Stores user information from Google OAuth
 */

const mongoose = require('mongoose');

const ADMIN_EMAILS = [
  'mahaveer.k2023it@sece.ac.in',
  'madhavakrishnan.t2023cse@sece.ac.in',
];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  picture: {
    type: String,
    default: null,
  },
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'User'],
    default: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Set role to Admin if email is in admin list, update updatedAt before saving
userSchema.pre('save', function (next) {
  if (ADMIN_EMAILS.includes(this.email)) {
    this.role = 'Admin';
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
module.exports.ADMIN_EMAILS = ADMIN_EMAILS;
