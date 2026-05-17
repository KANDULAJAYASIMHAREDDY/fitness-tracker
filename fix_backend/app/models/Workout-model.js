const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workoutPlanSchema = new Schema({
  trainerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true // ✅ still required, comes from middleware
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // ✅ optional now
  },
  title: {
    type: String,
    trim: true,
    required: false // ✅ optional now
  },
  description: {
    type: String,
    trim: true
  },
  exercises: [
    {
      exerciseId: { type: String, required: true }, // from external API
      name: { type: String, required: true, trim: true },
      target: { type: String, trim: true },
      equipment: { type: String, trim: true },
      videoUrl: { type: String, trim: true },
      sets: { type: Number, min: 1, required: true },
      reps: { type: Number, min: 1, required: true },
      restTime: { type: Number, min: 0 },
      notes: { type: String, trim: true }
    }
  ],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
module.exports = WorkoutPlan;