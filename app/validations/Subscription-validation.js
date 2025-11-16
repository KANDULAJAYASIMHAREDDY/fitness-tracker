const Joi = require('joi');

const subscriptionValidationSchema = Joi.object({
  clientId: Joi.string().required(),
  planName: Joi.string().min(3).max(100).required(),
  price: Joi.number().min(0).required(),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed').optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  paymentId: Joi.string().allow('', null).optional()
});

module.exports = { subscriptionValidationSchema };
