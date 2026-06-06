/**
 * RAG Service Integration
 * Communicates with FastAPI RAG backend
 */

const axios = require('axios');
const logger = require('../config/logger');

const RAG_API_URL = process.env.RAG_API_URL || 'https://taskflow-rag.onrender.com';

const ragClient = axios.create({
  baseURL: RAG_API_URL,
  timeout: 30000,
});

/**
 * Call RAG API /chat endpoint
 * @param {string} question - User question
 * @returns {Promise<Object>} RAG response with answer, sources, confidence, escalate
 */
const askRAG = async (question) => {
  try {
    logger.debug(`Calling RAG API with question: ${question}`);

    const response = await ragClient.post('/chat', {
      question,
    });

    logger.debug(`RAG API response received for question: ${question}`);

    return {
      answer: response.data.answer,
      sources: response.data.sources || [],
      confidence: response.data.confidence || 0,
      escalate: response.data.escalate || false,
    };
  } catch (error) {
    logger.error(`RAG API call failed: ${error.message}`);
    throw new Error(`Failed to get response from RAG service: ${error.message}`);
  }
};

/**
 * Health check for RAG API
 * @returns {Promise<boolean>}
 */
const checkRAGHealth = async () => {
  try {
    const response = await ragClient.get('/health');
    return response.data.status === 'healthy';
  } catch (error) {
    logger.error(`RAG health check failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  askRAG,
  checkRAGHealth,
};
