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
    }
},{Timestamp:true});

const Client = mongoose.model('Client',clientSchema);
module.exports = Client