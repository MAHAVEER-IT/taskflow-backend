/**
 * Authentication Routes
 */

const express = require('express');
const { googleAuth } = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/google
 * Google OAuth authentication
 */
router.post('/google', googleAuth);

module.exports = router;
