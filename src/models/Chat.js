/**
 * Chat Model
 * Stores chat history with RAG responses
 */

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
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
  answer: {
    type: String,
    required: true,
  },
  sources: {
    type: [String],
    default: [],
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  escalate: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for faster queries by userId and sorted by date
chatSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
