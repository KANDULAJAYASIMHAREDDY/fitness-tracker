const joi = require('joi');

const progressTrackerValidationSchema = joi.object({
  clientId: joi.string().required(),
  date: joi.date().optional(),
  weight: joi.number().min(0).required(),
  bmi: joi.number().min(0).required(),
  bodyFat: joi.number().min(0).max(100).required(), // ✅ matches schema
  caloriesBurned: joi.number().min(0).required(),
  workoutDuration: joi.number().min(0).optional(),
  notes: joi.string().max(500).allow('', null).optional()
});

module.exports = { progressTrackerValidationSchema };