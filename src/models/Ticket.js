/**
 * Ticket Model
 * Stores support tickets for escalated questions
 */

const mongoose = require('mongoose');

const TICKET_STATUSES = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
};

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: Object.values(TICKET_STATUSES),
    default: TICKET_STATUSES.OPEN,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
ticketSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries by userId
ticketSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
module.exports.TICKET_STATUSES = TICKET_STATUSES;
