const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:'User',//link to the User who is a client
        required: true
    },
    trainerId:{
        type:Schema.Types.ObjectId,
        ref:'Trainer', //the trainer assigned to this client
        required:false //optianal(client can register before assigning trainer)

    },
     name: {   // 👈 new field
    type: String,
    required: true,
    trim: true
  },

    goal:{
        type:String,
        required:true,
        trim:true

    },
    subscriptionStatus:{
        type:String,
        enum:['active','inactive','pending'],
        default:'pending'
    },
    progressId:{
        type:String,
        required:false
    },
    approved: { type: Boolean, default: false }

},{timestamps:true});

const Client = mongoose.model('Client',clientSchema);
module.exports = Client