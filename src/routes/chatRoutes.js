/**
 * Chat Routes
 */

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { postChat, getChatHistory } = require('../controllers/chatController');

const router = express.Router();

/**
 * POST /api/chat
 * Post a question and get AI response
 * Protected route
 */
router.post('/', authMiddleware, postChat);

/**
 * GET /api/chat/history
 * Get chat history for logged-in user
 * Protected route
 */
router.get('/history', authMiddleware, getChatHistory);

module.exports = router;
