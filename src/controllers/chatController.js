/**
 * Chat Controller
 * Handles chat questions and retrieval of chat history
 */

const Chat = require('../models/Chat');
const Ticket = require('../models/Ticket');
const { TICKET_STATUSES } = require('../models/Ticket');
const { askRAG } = require('../services/ragService');
const logger = require('../config/logger');
const { schemas, validate } = require('../utils/validation');
const { generateTicketId } = require('../utils/generateTicketId');

/**
 * Post a question and get AI response
 * Calls RAG service and stores chat in MongoDB
 */
const postChat = async (req, res) => {
  try {
    const { error, value } = validate(req.body, schemas.chat);

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      logger.warn(`Validation error in postChat: ${messages}`);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }

    const { question } = value;
    const userId = req.user.id;

    logger.debug(`Processing chat for user ${userId}: ${question}`);

    // Call RAG service
    const ragResponse = await askRAG(question);

    // Store chat in MongoDB
    const chat = new Chat({
      userId,
      question,
      answer: ragResponse.answer,
      sources: ragResponse.sources,
      confidence: ragResponse.confidence,
      escalate: ragResponse.escalate,
    });

    await chat.save();
    logger.info(`Chat saved for user ${userId}`);

    let ticket = null;
    if (ragResponse.escalate) {
      const ticketId = await generateTicketId();

      ticket = new Ticket({
        ticketId,
        userId,
        question,
        status: TICKET_STATUSES.OPEN,
      });

      await ticket.save();
      logger.info(`Auto-created escalation ticket ${ticketId} for user ${userId}`);
    }

    return res.status(201).json({
      success: true,
      data: {
        answer: ragResponse.answer,
        sources: ragResponse.sources,
        confidence: ragResponse.confidence,
        escalate: ragResponse.escalate,
        ticket: ticket
          ? {
              _id: ticket._id,
              ticketId: ticket.ticketId,
              question: ticket.question,
              status: ticket.status,
              createdAt: ticket.createdAt,
              updatedAt: ticket.updatedAt,
            }
          : null,
      },
    });
  } catch (error) {
    logger.error(`Chat error: ${error.message}`);

    return res.status(502).json({
      success: false,
      message: error.message || 'Failed to process chat',
    });
  }
};

/**
 * Get chat history for logged-in user
 * Returns chats sorted newest first
 */
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = parseInt(req.query.skip, 10) || 0;

    logger.debug(`Fetching chat history for user ${userId}`);

    const chats = await Chat.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Chat.countDocuments({ userId });

    logger.debug(`Retrieved ${chats.length} chats for user ${userId}`);

    return res.status(200).json({
      success: true,
      data: chats,
      pagination: {
        total,
        limit,
        skip,
      },
    });
  } catch (error) {
    logger.error(`Get chat history error: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
    });
  }
};

module.exports = {
  postChat,
  getChatHistory,
};
