/**
 * Ticket ID Generator Utility
 * Generates sequential ticket IDs: TKT-0001, TKT-0002, etc.
 */

const Ticket = require('../models/Ticket');
const logger = require('../config/logger');

/**
 * Generate next ticket ID
 * Queries database for highest ID and increments
 * @returns {Promise<string>} Generated ticket ID
 */
const generateTicketId = async () => {
  try {
    const lastTicket = await Ticket.findOne()
      .sort({ ticketId: -1 })
      .exec();

    let nextNumber = 1;

    if (lastTicket && lastTicket.ticketId) {
      const lastNumber = parseInt(lastTicket.ticketId.replace('TKT-', ''), 10);
      nextNumber = lastNumber + 1;
    }

    const ticketId = `TKT-${String(nextNumber).padStart(4, '0')}`;
    logger.debug(`Generated ticket ID: ${ticketId}`);

    return ticketId;
  } catch (error) {
    logger.error(`Failed to generate ticket ID: ${error.message}`);
    throw new Error('Failed to generate ticket ID');
  }
};

module.exports = { generateTicketId };
