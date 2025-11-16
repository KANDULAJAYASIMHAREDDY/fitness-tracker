const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const progressTrackerSchema = new Schema({
    clientId : {
        type:Schema.Types.ObjectId,
        ref:'Client',//links progress record to a specific client
        required:true
    },
    date:{
        type:Date,
        default:Date.now,

    },
    weight:{
        type:Number,
        min:0,
        required:false
    },
    bmi:{
        type:Number,
        min:0,
        required:false,
    },
    bodyfat:{
        type:Number,
        min:0,
        max:100,
        required:false
    },
    caloriesBurned:{
        type:Number,
        min:0,
        default:0
    },
    notes:{
        type:String,
        trim:true,
        maxLength:500

    }

},{timestamps:true});

const ProgressTracker = mongoose.model('ProgressTracker',progressTrackerSchema);
module.exports = ProgressTracker;