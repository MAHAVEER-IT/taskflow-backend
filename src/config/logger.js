/**
 * Centralized Logging Configuration
 * Uses console for development; can be extended for production
 */

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = levels[LOG_LEVEL] || levels.info;

const logger = {
  error: (message) => {
    if (currentLevel >= levels.error) {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    }
  },
  warn: (message) => {
    if (currentLevel >= levels.warn) {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    }
  },
  info: (message) => {
    if (currentLevel >= levels.info) {
      console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
    }
  },
  debug: (message) => {
    if (currentLevel >= levels.debug) {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
  },
};

module.exports = logger;
