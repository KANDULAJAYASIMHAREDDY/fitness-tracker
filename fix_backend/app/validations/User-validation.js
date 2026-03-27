const Joi = require('joi');

const userValidationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Trainer', 'Client').optional(),
  phonenumber: Joi.number().optional().allow(null, ''),
  gender: Joi.string().optional().allow(null, ''),
  age: Joi.number().optional().allow(null, ''),
  profileImage: Joi.string().optional().allow(null, '')
});

module.exports = { userValidationSchema };
