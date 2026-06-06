/**
 * Admin Authorization Middleware
 * Requires authMiddleware to run first and attach req.user.
 */

const logger = require('../config/logger');

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'Admin') {
    logger.warn(`Forbidden admin access attempt by user ${req.user?.id || 'unknown'}`);
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

module.exports = adminMiddleware;
