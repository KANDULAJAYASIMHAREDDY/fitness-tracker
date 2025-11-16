const Joi = require('joi');

const trainerValidationSchema = Joi.object({
  // userId not required because we’ll take it from token
  specialization: Joi.string().min(3).max(50).required().trim(),
  experience: Joi.number().min(0).max(50).required(),
  certifications: Joi.array().items(Joi.string().trim()).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  clients: Joi.array().items(Joi.string()).optional(),
  isAvailable: Joi.boolean().optional(),
  bio: Joi.string().max(500).allow('', null).optional(),
});

module.exports = { trainerValidationSchema };
