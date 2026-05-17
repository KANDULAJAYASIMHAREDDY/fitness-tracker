const Joi = require('joi');

const clientValidationSchema = Joi.object({
  name: Joi.string().trim().optional(),
  trainerId: Joi.string().optional().allow('', null),
  goal: Joi.string().min(2).max(200).required(),
  subscriptionStatus: Joi.string().valid('active', 'inactive', 'pending').optional(),
  progressId: Joi.string().optional().allow('', null)
});

module.exports = { clientValidationSchema };
