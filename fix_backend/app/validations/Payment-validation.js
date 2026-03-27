const Joi = require('joi');

const paymentValidationSchema = Joi.object({
  subscriptionId: Joi.string().required(),
  clientId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer').required(),
  transactionId: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('pending', 'success', 'failed').optional()
});

module.exports = { paymentValidationSchema };
