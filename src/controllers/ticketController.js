/**
 * Ticket Controller
 * Handles support ticket creation and management
 */

const Ticket = require('../models/Ticket');
const { TICKET_STATUSES } = require('../models/Ticket');
const { generateTicketId } = require('../utils/generateTicketId');
const logger = require('../config/logger');
const { schemas, validate } = require('../utils/validation');

/**
 * Create a new support ticket
 */
const createTicket = async (req, res) => {
  try {
    const { error, value } = validate(req.body, schemas.ticket);

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      logger.warn(`Validation error in createTicket: ${messages}`);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }

    const { question } = value;
    const userId = req.user.id;

    logger.debug(`Creating ticket for user ${userId}`);

    // Generate ticket ID
    const ticketId = await generateTicketId();

    // Create ticket
    const ticket = new Ticket({
      ticketId,
      userId,
      question,
      status: TICKET_STATUSES.OPEN,
    });

    await ticket.save();
    logger.info(`Ticket created: ${ticketId} for user ${userId}`);

    return res.status(201).json({
      success: true,
      data: {
        _id: ticket._id,
        ticketId: ticket.ticketId,
        question: ticket.question,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Create ticket error: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
    });
  }
};

/**
 * Get all tickets for logged-in user
 */
const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = parseInt(req.query.skip, 10) || 0;

    logger.debug(`Fetching tickets for user ${userId}`);

    const tickets = await Ticket.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Ticket.countDocuments({ userId });

    logger.debug(`Retrieved ${tickets.length} tickets for user ${userId}`);

    return res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        total,
        limit,
        skip,
      },
    });
  } catch (error) {
    logger.error(`Get user tickets error: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tickets',
    });
  }
};

/**
 * Get all tickets for admin users
 */
const getAllTickets = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = parseInt(req.query.skip, 10) || 0;

    logger.debug(`Admin ${req.user.id} fetching all tickets`);

    const tickets = await Ticket.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'name email')
      .lean();

    const total = await Ticket.countDocuments({});

    logger.debug(`Retrieved ${tickets.length} total tickets for admin ${req.user.id}`);

    return res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        total,
        limit,
        skip,
      },
    });
  } catch (error) {
    logger.error(`Get all tickets error: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve all tickets',
    });
  }
};

/**
 * Update ticket status
 */
const updateTicketStatus = async (req, res) => {
  try {
    const { error, value } = validate(req.body, schemas.updateTicket);

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      logger.warn(`Validation error in updateTicketStatus: ${messages}`);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }

    const { ticketId } = req.params;
    const { status } = value;
    const userId = req.user.id;

    logger.debug(`Updating ticket ${ticketId} status to ${status}`);

    const ticketQuery =
      req.user.role === 'Admin'
        ? { ticketId }
        : {
            ticketId,
            userId,
          };

    const ticket = await Ticket.findOne(ticketQuery);

    if (!ticket) {
      logger.warn(`Ticket not found: ${ticketId} for user ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    ticket.status = status;
    await ticket.save();

    logger.info(`Ticket ${ticketId} status updated to ${status}`);

    return res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.ticketId,
        status: ticket.status,
      },
    });
  } catch (error) {
    logger.error(`Update ticket status error: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
    });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getAllTickets,
  updateTicketStatus,
};
