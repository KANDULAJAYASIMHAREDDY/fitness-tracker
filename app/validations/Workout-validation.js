const Joi = require('joi');

const exerciseSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  sets: Joi.number().min(1).required(),
  reps: Joi.number().min(1).required(),
  restTime: Joi.number().min(0).optional(),
  notes: Joi.string().max(200).optional()
});

const workoutPlanValidationSchema = Joi.object({
  trainerId: Joi.string().required(),
  clientId: Joi.string().required(),
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  exercises: Joi.array().items(exerciseSchema).min(1).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  status: Joi.string().valid('active', 'completed', 'cancelled').optional()
});

module.exports = { workoutPlanValidationSchema };
