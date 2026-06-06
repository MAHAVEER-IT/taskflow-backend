/**
 * Validation Utilities
 * Input validation helpers
 */

const Joi = require('joi');

const schemas = {
  googleAuth: Joi.object({
    token: Joi.string().required(),
  }),
  chat: Joi.object({
    question: Joi.string().min(1).max(1000).required(),
  }),
  ticket: Joi.object({
    question: Joi.string().min(1).max(2000).required(),
  }),
  updateTicket: Joi.object({
    status: Joi.string()
      .valid('OPEN', 'IN_PROGRESS', 'CLOSED')
      .required(),
  }),
};

const validate = (data, schema) => {
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

module.exports = { schemas, validate };
