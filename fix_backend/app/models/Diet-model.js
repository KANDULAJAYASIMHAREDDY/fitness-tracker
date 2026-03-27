// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const dietPlanSchema = new Schema({
//   trainerId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Trainer',
//     required: true
//   },
//   clientId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Client',
//     required: true
//   },
//   meals: [
//     {
//       name: { type: String, required: true, trim: true }, // e.g., "Breakfast"
//       foodItems: [{ type: String, trim: true }], // e.g., ["Oats", "Banana", "Milk"]
//       calories: { type: Number, min: 0, required: true } // total for this meal
//     }
//   ],
//   totalCalories: {
//     type: Number,
//     min: 0,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['active', 'completed', 'cancelled'],
//     default: 'active'
//   }
// }, { timestamps: true });

// const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
// module.exports = DietPlan;




const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dietPlanSchema = new Schema({
  trainerId: {
    type: Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  meals: [
    {
      name: { type: String, required: true, trim: true },
      foodItems: [{ type: String, trim: true }],
      calories: { type: Number, min: 0, required: true }
    }
  ],
  totalCalories: {
    type: Number,
    min: 0,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
module.exports = DietPlan;