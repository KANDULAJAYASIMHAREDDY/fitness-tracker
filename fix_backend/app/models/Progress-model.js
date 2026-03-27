const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const progressTrackerSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client', // links progress record to a specific client
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  weight: {
    type: Number,
    min: 0
  },
  bmi: {
    type: Number,
    min: 0
  },
  bodyFat: {   // ✅ fixed naming consistency
    type: Number,
    min: 0,
    max: 100
  },
  caloriesBurned: {
    type: Number,
    min: 0,
    default: 0
  },
  workoutDuration: {
    type: Number,
    min: 0,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxLength: 500
  }
}, { timestamps: true });

const ProgressTracker = mongoose.model('ProgressTracker', progressTrackerSchema);
module.exports = ProgressTracker;