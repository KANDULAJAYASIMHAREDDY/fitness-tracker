const Joi = require('joi');

const mealSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  foodItems: Joi.array().items(Joi.string().min(2)).min(1).required(),
  calories: Joi.number().min(0).required()
});

const dietPlanValidationSchema = Joi.object({
  trainerId: Joi.string().required(),
  clientId: Joi.string().required(),
  meals: Joi.array().items(mealSchema).min(1).required(),
  totalCalories: Joi.number().min(0).required(),
  status: Joi.string().valid('active', 'completed', 'cancelled').optional()
});

module.exports = { dietPlanValidationSchema };
