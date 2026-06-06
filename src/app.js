/**
 * Express Application Setup
 * Middleware configuration and route mounting
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./config/logger');
const { checkRAGHealth } = require('./services/ragService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();

// ============ Middleware ============

// Security
app.use(helmet());
app.use(cors());

// Logging
app.use(
  morgan(':method :url :status :response-time ms', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============ Health Check ============

app.get('/health', async (req, res) => {
  const ragHealthy = await checkRAGHealth();

  res.status(200).json({
    success: true,
    status: 'Server is running',
    rag: {
      url: process.env.RAG_API_URL || 'http://localhost:8000',
      healthy: ragHealthy,
    },
    timestamp: new Date().toISOString(),
  });
});

// ============ API Routes ============

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tickets', ticketRoutes);

// ============ 404 Handler ============

app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// ============ Error Handler ============

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.debug(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
