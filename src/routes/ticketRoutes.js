/**
 * Ticket Routes
 */

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createTicket,
  getAllTickets,
  getUserTickets,
  updateTicketStatus,
} = require('../controllers/ticketController');

const router = express.Router();

/**
 * POST /api/tickets
 * Create a new support ticket
 * Protected route
 */
router.post('/', authMiddleware, createTicket);

/**
 * GET /api/tickets/admin/all
 * Get all tickets for admins
 * Protected admin route
 */
router.get('/admin/all', authMiddleware, adminMiddleware, getAllTickets);

/**
 * GET /api/tickets
 * Get all tickets for logged-in user
 * Protected route
 */
router.get('/', authMiddleware, getUserTickets);

/**
 * PATCH /api/tickets/:ticketId
 * Update ticket status
 * Protected route
 */
router.patch('/:ticketId', authMiddleware, updateTicketStatus);

module.exports = router;
