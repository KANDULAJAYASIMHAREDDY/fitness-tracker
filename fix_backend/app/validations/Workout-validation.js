const Joi = require('joi');

const exerciseSchema = Joi.object({
  exerciseId: Joi.string().required(), // from FreeWebAPI
  name: Joi.string().min(2).max(100).required(),
  target: Joi.string().max(100).optional().allow(""),
  equipment: Joi.string().max(100).optional().allow(""),
 videoUrl: Joi.string().uri().optional().allow(""),
  sets: Joi.number().min(1).required(),
  reps: Joi.number().min(1).required(),
  restTime: Joi.number().min(0).optional(),
  notes: Joi.string().max(200).optional().allow("")
});

const workoutPlanValidationSchema = Joi.object({
  // ✅ trainerId removed — handled by middleware (req.userId)
  clientId: Joi.string().optional().allow(""),
  title: Joi.string().min(3).max(100).optional().allow(""),
  description: Joi.string().max(500).optional().allow(""),
  exercises: Joi.array().items(exerciseSchema).min(1).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  status: Joi.string().valid('active', 'completed', 'cancelled').optional()
});

module.exports = { workoutPlanValidationSchema };