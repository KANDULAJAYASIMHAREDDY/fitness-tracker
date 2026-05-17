const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trainerSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',//reference to the user model
        required:true,
    },
     name: {   // 👈 new field for trainer's name
    type: String,
    required: true,
    trim: true,
  },

    specialization:{
        type:String,
        required:true,
        trim:true,
    },
    experience:{
        type:Number,
        required:true,
        min:0,
    },
    certifications:[
        {
            type:String,
            trim:true,
        },
    ],
    rating:{
        type:Number,
        min:0,
        max:5,
        default:0,
    },
    clients:[
        {
            type:Schema.Types.ObjectId,
            ref:'Client',//refer to the CLIENT MODEL
        },
    ],
    isAvailable:{
        type:Boolean,
        default:true,
    },
    bio:{
        type:String,
        trim:true,
    },

},{timestamps:true,})

const Trainer = mongoose.model('Trainer',trainerSchema);
module.exports = Trainer;