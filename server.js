/**
 * Server Entry Point
 * Starts the Express server and connects to MongoDB
 */

require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`RAG API URL: ${process.env.RAG_API_URL}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Server shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Server terminated...');
  process.exit(0);
});

startServer();
