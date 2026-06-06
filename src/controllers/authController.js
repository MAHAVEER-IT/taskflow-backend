/**
 * Authentication Controller
 * Handles user authentication via Google OAuth
 */

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const logger = require('../config/logger');
const { schemas, validate } = require('../utils/validation');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google token and authenticate user
 * Creates user if doesn't exist, generates JWT
 */
const googleAuth = async (req, res) => {
  try {
    const { error, value } = validate(req.body, schemas.googleAuth);

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      logger.warn(`Validation error in googleAuth: ${messages}`);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }

    const { token } = value;
    logger.debug('Verifying Google token');

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    logger.debug(`Google token verified for email: ${email}`);

    // Find or create user
    let user = await User.findOne({ googleId });

    if (!user) {
      logger.info(`Creating new user: ${email}`);
      user = new User({
        name,
        email,
        picture: picture || null,
        googleId,
      });
      await user.save();
    } else {
      // Update profile info if changed
      if (user.name !== name || user.picture !== picture) {
        user.name = name;
        user.picture = picture || null;
        await user.save();
        logger.debug(`Updated user profile: ${email}`);
      }
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      }
    );

    logger.info(`User authenticated successfully: ${email}`);

    return res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`Google auth error: ${error.message}`);

    if (error.message.includes('Invalid token')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

module.exports = {
  googleAuth,
};
