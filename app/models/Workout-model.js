const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workoutPlanSchema = new Schema({
    trainerId:{
        type:Schema.Types.ObjectId,
        ref:'Trainer',
        required:true

    },
    clientId:{
        type:Schema.Types.ObjectId,
        ref:'Client',
        required:true

    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    exercises:[
        {
            name:{type:String,required:true,trim:true},
            sets:{type:Number,min:1,required:true},
            reps:{type:Number,min:1,required:true},
            restTime:{type:Number,min:0,required:false},
            notes:{type:String,trim:true}
        }
    ],
    startDate:{
        type:Date,
        required:true
    },
      endDate: {
    type: Date,
    required: true
  },
    status:{
        type:String,
        enum:['active','completed','cancelled'],
        default:'active'
    }
},{timestamps:true});

const WorkoutPlan = mongoose.model('WorkoutPlan',workoutPlanSchema);
module.exports = WorkoutPlan;